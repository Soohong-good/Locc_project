package com.example.locc.domain.staff.service;

import com.example.locc.domain.staff.dto.command.StaffCreateCommand;
import com.example.locc.domain.staff.dto.command.StaffUpdateCommand;
import com.example.locc.domain.staff.dto.response.StaffResponse;
import com.example.locc.domain.staff.entity.Staff;
import com.example.locc.domain.staff.repository.StaffRepository;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

/**
 * StaffCommandService 단위 테스트 (Mockito, DB 불필요)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("StaffCommandService 단위 테스트")
class StaffCommandServiceTest {

    @Mock private StaffRepository staffRepository;
    @Mock private StaffQueryService staffQueryService;
    @Mock private UserRepository userRepository;

    @InjectMocks private StaffCommandService staffCommandService;

    private StaffCreateCommand createCommand(Boolean isSeniorPastor) {
        return StaffCreateCommand.builder()
                .name("홍목사").englishName("Hong")
                .position(Staff.StaffPosition.PASTOR)
                .category(Staff.StaffCategory.MINISTER)
                .isSeniorPastor(isSeniorPastor)
                .createdByEmail("admin@test.com")
                .build();
    }

    @Test
    @DisplayName("생성 - 사용자를 찾을 수 없으면 UsernameNotFoundException")
    void create_userNotFound() {
        given(userRepository.findByEmail("admin@test.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> staffCommandService.create(createCommand(false)))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    @DisplayName("생성 - 관리자/운영자가 아니면 IllegalStateException")
    void create_noPermission() {
        User user = mock(User.class);
        given(userRepository.findByEmail("admin@test.com")).willReturn(Optional.of(user));
        given(user.isAdminOrOperator()).willReturn(false);

        assertThatThrownBy(() -> staffCommandService.create(createCommand(false)))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("생성 - 담임목사로 등록하면 기존 담임목사를 먼저 해제한다")
    void create_seniorPastor_unsetsExisting() {
        User user = mock(User.class);
        given(userRepository.findByEmail("admin@test.com")).willReturn(Optional.of(user));
        given(user.isAdminOrOperator()).willReturn(true);
        given(staffRepository.save(any(Staff.class))).willAnswer(inv -> inv.getArgument(0));

        StaffResponse response = staffCommandService.create(createCommand(true));

        verify(staffRepository).unsetAllSeniorPastors();
        assertThat(response.getIsSeniorPastor()).isTrue();
    }

    @Test
    @DisplayName("생성 - 일반 등록이면 담임목사 해제를 호출하지 않는다")
    void create_notSeniorPastor_doesNotUnset() {
        User user = mock(User.class);
        given(userRepository.findByEmail("admin@test.com")).willReturn(Optional.of(user));
        given(user.isAdminOrOperator()).willReturn(true);
        given(staffRepository.save(any(Staff.class))).willAnswer(inv -> inv.getArgument(0));

        staffCommandService.create(createCommand(false));

        verify(staffRepository, never()).unsetAllSeniorPastors();
    }

    @Test
    @DisplayName("수정 - 권한이 없으면 IllegalStateException")
    void update_noPermission() {
        Staff staff = Staff.create(createCommand(false));
        User user = mock(User.class);
        given(staffQueryService.findEntityById(1L)).willReturn(staff);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(user));
        given(user.isAdminOrOperator()).willReturn(false);

        StaffUpdateCommand command = StaffUpdateCommand.builder()
                .staffId(1L).name("새이름").updatedByEmail("user@test.com").build();

        assertThatThrownBy(() -> staffCommandService.update(command))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("수정 - 담임목사로 승격되면 기존 담임목사를 해제하고 재조회한다")
    void update_promotingToSeniorPastor_unsetsAndRefetches() {
        Staff staff = Staff.create(createCommand(false)); // isSeniorPastor=false
        Staff refetched = Staff.create(createCommand(false));
        User user = mock(User.class);
        given(staffQueryService.findEntityById(1L)).willReturn(staff, refetched);
        given(userRepository.findByEmail("admin@test.com")).willReturn(Optional.of(user));
        given(user.isAdminOrOperator()).willReturn(true);

        StaffUpdateCommand command = StaffUpdateCommand.builder()
                .staffId(1L).name("새이름").position(Staff.StaffPosition.PASTOR)
                .isSeniorPastor(true).updatedByEmail("admin@test.com").build();

        StaffResponse response = staffCommandService.update(command);

        verify(staffRepository).unsetAllSeniorPastors();
        assertThat(response.getName()).isEqualTo("새이름");
        assertThat(response.getIsSeniorPastor()).isTrue();
    }

    @Test
    @DisplayName("수정 - 이미 담임목사면 승격 로직(재해제)이 실행되지 않는다")
    void update_alreadySeniorPastor_doesNotResetAgain() {
        Staff staff = Staff.create(createCommand(true)); // 이미 담임목사
        User user = mock(User.class);
        given(staffQueryService.findEntityById(1L)).willReturn(staff);
        given(userRepository.findByEmail("admin@test.com")).willReturn(Optional.of(user));
        given(user.isAdminOrOperator()).willReturn(true);

        StaffUpdateCommand command = StaffUpdateCommand.builder()
                .staffId(1L).name("새이름").position(Staff.StaffPosition.PASTOR)
                .isSeniorPastor(true).updatedByEmail("admin@test.com").build();

        staffCommandService.update(command);

        verify(staffRepository, never()).unsetAllSeniorPastors();
    }

    @Test
    @DisplayName("삭제 - 권한이 없으면 IllegalStateException")
    void delete_noPermission() {
        Staff staff = Staff.create(createCommand(false));
        User user = mock(User.class);
        given(staffQueryService.findEntityById(1L)).willReturn(staff);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(user));
        given(user.isAdminOrOperator()).willReturn(false);

        assertThatThrownBy(() -> staffCommandService.delete(1L, "user@test.com"))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("삭제 - 정상 케이스면 repository.delete가 호출된다")
    void delete_success() {
        Staff staff = Staff.create(createCommand(false));
        User user = mock(User.class);
        given(staffQueryService.findEntityById(1L)).willReturn(staff);
        given(userRepository.findByEmail("admin@test.com")).willReturn(Optional.of(user));
        given(user.isAdminOrOperator()).willReturn(true);

        staffCommandService.delete(1L, "admin@test.com");

        verify(staffRepository).delete(staff);
    }

    @Test
    @DisplayName("이미지 업데이트 - 정상 케이스면 이미지 경로가 반영된다")
    void updateImage_success() {
        Staff staff = Staff.create(createCommand(false));
        User user = mock(User.class);
        given(staffQueryService.findEntityById(1L)).willReturn(staff);
        given(userRepository.findByEmail("admin@test.com")).willReturn(Optional.of(user));
        given(user.isAdminOrOperator()).willReturn(true);

        StaffResponse response = staffCommandService.updateImage(1L, "/uploads/staff/new.jpg", "admin@test.com");

        assertThat(response.getImagePath()).isEqualTo("/uploads/staff/new.jpg");
    }
}
