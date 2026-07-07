package com.example.locc.domain.application.service;

import com.example.locc.domain.application.dto.command.FacilityCreateCommand;
import com.example.locc.domain.application.entity.FacilityApplication;
import com.example.locc.domain.application.entity.FacilityCategory;
import com.example.locc.domain.application.repository.FacilityApplicationRepository;
import com.example.locc.domain.application.repository.FacilityCategoryRepository;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.exception.NotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

/**
 * FacilityCommandService 단위 테스트 (Mockito, DB 불필요)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("FacilityCommandService 단위 테스트")
class FacilityCommandServiceTest {

    @Mock private FacilityApplicationRepository applicationRepository;
    @Mock private FacilityCategoryRepository categoryRepository;
    @Mock private FacilityQueryService queryService;
    @Mock private UserRepository userRepository;

    @InjectMocks private FacilityCommandService facilityCommandService;

    private FacilityCreateCommand createCommand() {
        return FacilityCreateCommand.builder()
                .formType("차량신청")
                .userEmail("user@test.com")
                .useDate(LocalDate.now())
                .useStartTime(LocalTime.of(9, 0))
                .useEndTime(LocalTime.of(10, 0))
                .purpose("심방")
                .headCount(2)
                .build();
    }

    @Test
    @DisplayName("신청 생성 - 사용자를 찾을 수 없으면 UsernameNotFoundException")
    void create_userNotFound() {
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> facilityCommandService.create(createCommand()))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    @DisplayName("신청 생성 - 카테고리가 없으면 자동 생성 후 저장한다")
    void create_categoryAutoCreated() {
        User user = mock(User.class);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(user));
        given(categoryRepository.findByName("차량신청")).willReturn(Optional.empty());
        FacilityCategory newCategory = FacilityCategory.create("차량신청", null, 0);
        given(categoryRepository.save(any(FacilityCategory.class))).willReturn(newCategory);
        given(applicationRepository.save(any(FacilityApplication.class)))
                .willAnswer(invocation -> invocation.getArgument(0));

        var response = facilityCommandService.create(createCommand());

        assertThat(response.getCategoryName()).isEqualTo("차량신청");
    }

    @Test
    @DisplayName("신청 생성 - 카테고리가 비활성화 상태면 IllegalStateException")
    void create_inactiveCategory() {
        User user = mock(User.class);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(user));
        FacilityCategory inactive = FacilityCategory.create("차량신청", null, 0);
        inactive.deactivate();
        given(categoryRepository.findByName("차량신청")).willReturn(Optional.of(inactive));

        assertThatThrownBy(() -> facilityCommandService.create(createCommand()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("비활성화");
    }

    @Test
    @DisplayName("신청 취소 - 취소 불가능한 상태면 IllegalStateException")
    void cancel_notCancellable() {
        User user = mock(User.class);
        FacilityApplication application = mock(FacilityApplication.class);
        given(queryService.findEntityById(1L)).willReturn(application);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(user));
        given(application.canCancel(user)).willReturn(false);

        assertThatThrownBy(() -> facilityCommandService.cancel(1L, "user@test.com"))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("신청 취소 - 정상 케이스면 repository.delete가 호출된다")
    void cancel_success() {
        User user = mock(User.class);
        FacilityApplication application = mock(FacilityApplication.class);
        given(queryService.findEntityById(1L)).willReturn(application);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(user));
        given(application.canCancel(user)).willReturn(true);

        facilityCommandService.cancel(1L, "user@test.com");

        verify(applicationRepository).delete(application);
    }

    @Test
    @DisplayName("신청 완료 처리 - 상태를 완료로 바꾸고 관리자 메모를 반영한다")
    void complete_updatesStatusAndMemo() {
        User user = mock(User.class);
        FacilityCategory category = FacilityCategory.create("차량신청", null, 0);
        FacilityApplication application = FacilityApplication.create(createCommand(), category, user);
        given(queryService.findEntityById(1L)).willReturn(application);

        var response = facilityCommandService.complete(1L, "확인했습니다");

        assertThat(response.getStatusLabel()).isEqualTo("처리 완료");
        assertThat(response.getAdminMemo()).isEqualTo("확인했습니다");
    }

    @Test
    @DisplayName("카테고리 수정 - 존재하지 않으면 NotFoundException")
    void updateCategory_notFound() {
        given(categoryRepository.findById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> facilityCommandService.updateCategory(1L, "이름", "설명", 1))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("카테고리 활성화 토글 - 활성 상태면 비활성화로 전환된다")
    void toggleCategoryActive_deactivates() {
        FacilityCategory category = FacilityCategory.create("차량신청", null, 0);
        given(categoryRepository.findById(1L)).willReturn(Optional.of(category));

        facilityCommandService.toggleCategoryActive(1L);

        assertThat(category.getIsActive()).isFalse();
    }
}
