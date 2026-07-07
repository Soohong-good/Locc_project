package com.example.locc.domain.application.service;

import com.example.locc.domain.application.dto.command.FacilityCreateCommand;
import com.example.locc.domain.application.dto.request.FacilitySearchCondition;
import com.example.locc.domain.application.dto.response.FacilityApplicationDetailResponse;
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
import org.springframework.data.domain.Page;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;

/**
 * FacilityQueryService 단위 테스트 (Mockito, DB 불필요)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("FacilityQueryService 단위 테스트")
class FacilityQueryServiceTest {

    @Mock private FacilityApplicationRepository applicationRepository;
    @Mock private FacilityCategoryRepository categoryRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private FacilityQueryService facilityQueryService;

    private FacilityApplication newApplication(User user) {
        FacilityCategory category = FacilityCategory.create("차량신청", null, 0);
        FacilityCreateCommand command = FacilityCreateCommand.builder()
                .useDate(LocalDate.now())
                .useStartTime(LocalTime.of(9, 0))
                .useEndTime(LocalTime.of(10, 0))
                .purpose("심방")
                .headCount(2)
                .build();
        return FacilityApplication.create(command, category, user);
    }

    @Test
    @DisplayName("활성 카테고리 조회 - repository 결과를 매핑해 반환한다")
    void findActiveCategories() {
        given(categoryRepository.findAllByIsActiveTrueOrderBySortOrderAsc())
                .willReturn(List.of(FacilityCategory.create("차량신청", null, 0)));

        var result = facilityQueryService.findActiveCategories();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("차량신청");
    }

    @Test
    @DisplayName("내 신청 목록 조회 - 사용자 ID 기준으로 페이징 조회한다")
    void findMyList() {
        User user = mock(User.class);
        UUID userId = UUID.randomUUID();
        given(user.getId()).willReturn(userId);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(user));
        given(applicationRepository.findByUserIdOrderByCreatedAtDesc(any(UUID.class), any()))
                .willReturn(Page.empty());

        Page<?> result = facilityQueryService.findMyList("user@test.com", 0, 10);

        assertThat(result.getContent()).isEmpty();
    }

    @Test
    @DisplayName("상세 조회 - 존재하지 않으면 NotFoundException")
    void findDetail_notFound() {
        given(applicationRepository.findWithDetailById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> facilityQueryService.findDetail(1L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("사용자용 상세 조회 - 본인이 아니고 관리자/운영자도 아니면 AccessDeniedException")
    void findDetailForUser_notOwnerNorAdmin() {
        User owner = mock(User.class);
        given(owner.getEmail()).willReturn("owner@test.com");
        FacilityApplication application = newApplication(owner);
        given(applicationRepository.findWithDetailById(1L)).willReturn(Optional.of(application));

        User other = mock(User.class);
        given(userRepository.findByEmail("other@test.com")).willReturn(Optional.of(other));
        given(other.isAdminOrOperator()).willReturn(false);

        assertThatThrownBy(() -> facilityQueryService.findDetailForUser(1L, "other@test.com"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("사용자용 상세 조회 - 본인이면 조회 가능하다")
    void findDetailForUser_owner() {
        User owner = mock(User.class);
        given(owner.getEmail()).willReturn("owner@test.com");
        given(owner.getName()).willReturn("홍길동");
        FacilityApplication application = newApplication(owner);
        given(applicationRepository.findWithDetailById(1L)).willReturn(Optional.of(application));
        given(userRepository.findByEmail("owner@test.com")).willReturn(Optional.of(owner));

        FacilityApplicationDetailResponse response = facilityQueryService.findDetailForUser(1L, "owner@test.com");

        assertThat(response.getApplicantName()).isEqualTo("홍길동");
    }

    @Test
    @DisplayName("사용자용 상세 조회 - 본인이 아니어도 관리자/운영자면 조회 가능하다")
    void findDetailForUser_adminOrOperator() {
        User owner = mock(User.class);
        given(owner.getEmail()).willReturn("owner@test.com");
        given(owner.getName()).willReturn("홍길동");
        FacilityApplication application = newApplication(owner);
        given(applicationRepository.findWithDetailById(1L)).willReturn(Optional.of(application));

        User admin = mock(User.class);
        given(userRepository.findByEmail("admin@test.com")).willReturn(Optional.of(admin));
        given(admin.isAdminOrOperator()).willReturn(true);

        FacilityApplicationDetailResponse response = facilityQueryService.findDetailForUser(1L, "admin@test.com");

        assertThat(response.getApplicantName()).isEqualTo("홍길동");
    }

    @Test
    @DisplayName("엑셀 다운로드용 전체 목록 - 조건에 맞는 목록을 그대로 반환한다")
    void findAllForExcel() {
        FacilitySearchCondition condition = new FacilitySearchCondition();
        given(applicationRepository.findAllForExcel(null, null)).willReturn(List.of());

        List<FacilityApplication> result = facilityQueryService.findAllForExcel(condition);

        assertThat(result).isEmpty();
    }
}
