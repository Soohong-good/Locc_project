package com.example.locc.domain.user.service;

import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.exception.InvalidInputException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

/**
 * UserQueryService 단위 테스트 (Mockito, DB 불필요)
 * - 조회/카운트/검증 로직의 정상·예외 경로를 검증한다.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserQueryService 단위 테스트")
class UserQueryServiceTest {

    @Mock private UserRepository userRepository;

    @InjectMocks private UserQueryService userQueryService;

    // ───────────── 목록 조회 ─────────────

    @Test
    @DisplayName("승인 대기 목록 - PENDING 상태로 조회한다")
    void getPendingUsers_queriesPending() {
        given(userRepository.findByApprovalStatusAndDeletedFalse(eq(User.ApprovalStatus.PENDING), any(Pageable.class)))
                .willReturn(Page.empty());

        Page<?> result = userQueryService.getPendingUsers(PageRequest.of(0, 20));

        assertThat(result).isEmpty();
        verify(userRepository).findByApprovalStatusAndDeletedFalse(eq(User.ApprovalStatus.PENDING), any(Pageable.class));
    }

    @Test
    @DisplayName("승인 회원 목록 - APPROVED 상태 + 권한 오름차순/가입일 내림차순 정렬로 조회한다")
    void getAllUsers_approvedWithSort() {
        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        given(userRepository.findByApprovalStatusAndDeletedFalse(eq(User.ApprovalStatus.APPROVED), captor.capture()))
                .willReturn(Page.empty());

        userQueryService.getAllUsers(PageRequest.of(0, 20));

        Sort sort = captor.getValue().getSort();
        assertThat(sort.getOrderFor("role").getDirection()).isEqualTo(Sort.Direction.ASC);
        assertThat(sort.getOrderFor("createdAt").getDirection()).isEqualTo(Sort.Direction.DESC);
    }

    // ───────────── 상세 / 단건 조회 ─────────────

    @Test
    @DisplayName("회원 상세 - 사용자가 없으면 IllegalArgumentException")
    void getUserDetail_notFound() {
        UUID id = UUID.randomUUID();
        given(userRepository.findByIdWithSocialAccounts(id)).willReturn(Optional.empty());

        assertThatThrownBy(() -> userQueryService.getUserDetail(id))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("이메일 조회 - 정상 시 User 반환")
    void findByEmail_returnsUser() {
        User user = mock(User.class);
        given(userRepository.findByEmail("u@test.com")).willReturn(Optional.of(user));

        assertThat(userQueryService.findByEmail("u@test.com")).isSameAs(user);
    }

    @Test
    @DisplayName("이메일 조회 - 없으면 IllegalArgumentException")
    void findByEmail_notFound() {
        given(userRepository.findByEmail("ghost@test.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> userQueryService.findByEmail("ghost@test.com"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("이메일+소셜 조회 - 정상 시 User 반환")
    void findByEmailWithSocial_returnsUser() {
        User user = mock(User.class);
        given(userRepository.findByEmailWithSocialAccounts("u@test.com")).willReturn(Optional.of(user));

        assertThat(userQueryService.findByEmailWithSocialAccounts("u@test.com")).isSameAs(user);
    }

    @Test
    @DisplayName("이메일+소셜 조회 - 없으면 IllegalArgumentException")
    void findByEmailWithSocial_notFound() {
        given(userRepository.findByEmailWithSocialAccounts("ghost@test.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> userQueryService.findByEmailWithSocialAccounts("ghost@test.com"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("활성 사용자 조회 - 정상 시 User 반환")
    void findActiveByEmail_returnsUser() {
        User user = mock(User.class);
        given(userRepository.findActiveByEmail("u@test.com")).willReturn(Optional.of(user));

        assertThat(userQueryService.findActiveByEmail("u@test.com")).isSameAs(user);
    }

    @Test
    @DisplayName("활성 사용자 조회 - 없으면 IllegalArgumentException")
    void findActiveByEmail_notFound() {
        given(userRepository.findActiveByEmail("ghost@test.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> userQueryService.findActiveByEmail("ghost@test.com"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("ID 조회(내부용) - 정상 시 User 반환")
    void findById_returnsUser() {
        UUID id = UUID.randomUUID();
        User user = mock(User.class);
        given(userRepository.findById(id)).willReturn(Optional.of(user));

        assertThat(userQueryService.findById(id)).isSameAs(user);
    }

    @Test
    @DisplayName("ID 조회(내부용) - 없으면 IllegalArgumentException")
    void findById_notFound() {
        UUID id = UUID.randomUUID();
        given(userRepository.findById(id)).willReturn(Optional.empty());

        assertThatThrownBy(() -> userQueryService.findById(id))
                .isInstanceOf(IllegalArgumentException.class);
    }

    // ───────────── 카운트 (repository 위임) ─────────────

    @Test
    @DisplayName("승인 대기 수 - repository 결과를 그대로 반환")
    void countPendingUsers() {
        given(userRepository.countByApprovalStatusAndDeletedFalse(User.ApprovalStatus.PENDING)).willReturn(3L);
        assertThat(userQueryService.countPendingUsers()).isEqualTo(3L);
    }

    @Test
    @DisplayName("승인 완료 수 - repository 결과를 그대로 반환")
    void countApprovedUsers() {
        given(userRepository.countByApprovalStatusAndDeletedFalse(User.ApprovalStatus.APPROVED)).willReturn(10L);
        assertThat(userQueryService.countApprovedUsers()).isEqualTo(10L);
    }

    @Test
    @DisplayName("반려 수 - repository 결과를 그대로 반환")
    void countRejectedUsers() {
        given(userRepository.countByApprovalStatusAndDeletedFalse(User.ApprovalStatus.REJECTED)).willReturn(1L);
        assertThat(userQueryService.countRejectedUsers()).isEqualTo(1L);
    }

    @Test
    @DisplayName("전체 수 - repository.count() 결과를 그대로 반환")
    void countAllUsers() {
        given(userRepository.count()).willReturn(99L);
        assertThat(userQueryService.countAllUsers()).isEqualTo(99L);
    }

    // ───────────── 이메일 사용 가능 검증 ─────────────

    @Test
    @DisplayName("이메일 검증 - 중복이면 InvalidInputException")
    void validateEmailAvailable_duplicate() {
        given(userRepository.existsByEmail("dup@test.com")).willReturn(true);

        assertThatThrownBy(() -> userQueryService.validateEmailAvailable("dup@test.com"))
                .isInstanceOf(InvalidInputException.class);
    }

    @Test
    @DisplayName("이메일 검증 - 사용 가능하면 예외를 던지지 않는다")
    void validateEmailAvailable_available() {
        given(userRepository.existsByEmail("new@test.com")).willReturn(false);

        assertThatCode(() -> userQueryService.validateEmailAvailable("new@test.com"))
                .doesNotThrowAnyException();
    }
}
