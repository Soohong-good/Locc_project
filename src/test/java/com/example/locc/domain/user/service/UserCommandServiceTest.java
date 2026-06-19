package com.example.locc.domain.user.service;

import com.example.locc.config.JwtProperties;
import com.example.locc.domain.auth.service.EmailVerificationService;
import com.example.locc.domain.user.dto.command.UserRegisterCommand;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.RefreshTokenRepository;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.exception.InvalidInputException;
import com.example.locc.security.JwtTokenProvider;
import com.example.locc.security.TotpService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

/**
 * UserCommandService 단위 테스트 (Mockito, DB 불필요)
 * - 회원가입/승인/권한/차단/TOTP의 검증·분기 로직을 검증한다.
 * - static 팩토리(User.register)·AuthenticationManager 의존 경로는 단위 테스트 한계라 예외 경로 중심.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserCommandService 단위 테스트")
class UserCommandServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private UserQueryService userQueryService;
    @Mock private EmailVerificationService emailVerificationService;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtTokenProvider jwtTokenProvider;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtProperties jwtProperties;
    @Mock private TotpService totpService;

    @InjectMocks private UserCommandService userCommandService;

    // ───────────── 회원가입 ─────────────

    @Test
    @DisplayName("회원가입 - 이메일 중복이면 IllegalArgumentException")
    void register_duplicateEmail() {
        UserRegisterCommand command = mock(UserRegisterCommand.class);
        given(command.getEmail()).willReturn("dup@test.com");
        given(userRepository.existsByEmail("dup@test.com")).willReturn(true);

        assertThatThrownBy(() -> userCommandService.register(command))
                .isInstanceOf(IllegalArgumentException.class);
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("회원가입 - 이메일 인증 미완료면 InvalidInputException")
    void register_emailNotVerified() {
        UserRegisterCommand command = mock(UserRegisterCommand.class);
        given(command.getEmail()).willReturn("new@test.com");
        given(userRepository.existsByEmail("new@test.com")).willReturn(false);
        given(emailVerificationService.consumeVerification("new@test.com")).willReturn(false);

        assertThatThrownBy(() -> userCommandService.register(command))
                .isInstanceOf(InvalidInputException.class);
        verify(userRepository, never()).save(any());
    }

    // ───────────── 운영자 권한 ─────────────

    @Test
    @DisplayName("운영자 부여 - 총관리자 계정이면 IllegalStateException")
    void grantOperator_adminBlocked() {
        UUID id = UUID.randomUUID();
        User user = mock(User.class);
        given(userQueryService.findById(id)).willReturn(user);
        given(user.getRole()).willReturn(User.Role.ADMIN);

        assertThatThrownBy(() -> userCommandService.grantOperator(id))
                .isInstanceOf(IllegalStateException.class);
        verify(user, never()).grantOperator();
    }

    @Test
    @DisplayName("운영자 부여 - 일반 회원이면 권한을 부여한다")
    void grantOperator_success() {
        UUID id = UUID.randomUUID();
        User user = mock(User.class);
        given(userQueryService.findById(id)).willReturn(user);
        given(user.getRole()).willReturn(User.Role.USER);

        userCommandService.grantOperator(id);

        verify(user).grantOperator();
    }

    @Test
    @DisplayName("운영자 회수 - 총관리자 계정이면 IllegalStateException")
    void revokeOperator_adminBlocked() {
        UUID id = UUID.randomUUID();
        User user = mock(User.class);
        given(userQueryService.findById(id)).willReturn(user);
        given(user.getRole()).willReturn(User.Role.ADMIN);

        assertThatThrownBy(() -> userCommandService.revokeOperator(id))
                .isInstanceOf(IllegalStateException.class);
        verify(user, never()).revokeOperator();
    }

    // ───────────── 승인 / 반려 ─────────────

    @Test
    @DisplayName("승인 - 대기 상태가 아니면 IllegalStateException")
    void approve_notPending() {
        UUID id = UUID.randomUUID();
        User user = mock(User.class);
        given(userQueryService.findById(id)).willReturn(user);
        given(user.getApprovalStatus()).willReturn(User.ApprovalStatus.APPROVED);

        assertThatThrownBy(() -> userCommandService.approve(id))
                .isInstanceOf(IllegalStateException.class);
        verify(user, never()).approve();
    }

    @Test
    @DisplayName("승인 - 대기 상태면 승인 처리한다")
    void approve_success() {
        UUID id = UUID.randomUUID();
        User user = mock(User.class);
        given(userQueryService.findById(id)).willReturn(user);
        given(user.getApprovalStatus()).willReturn(User.ApprovalStatus.PENDING);

        userCommandService.approve(id);

        verify(user).approve();
    }

    @Test
    @DisplayName("반려 - 대기 상태가 아니면 IllegalStateException")
    void reject_notPending() {
        UUID id = UUID.randomUUID();
        User user = mock(User.class);
        given(userQueryService.findById(id)).willReturn(user);
        given(user.getApprovalStatus()).willReturn(User.ApprovalStatus.APPROVED);

        assertThatThrownBy(() -> userCommandService.reject(id, "사유"))
                .isInstanceOf(IllegalStateException.class);
        verify(user, never()).reject(any());
    }

    @Test
    @DisplayName("반려 - 대기 상태면 사유와 함께 반려한다")
    void reject_success() {
        UUID id = UUID.randomUUID();
        User user = mock(User.class);
        given(userQueryService.findById(id)).willReturn(user);
        given(user.getApprovalStatus()).willReturn(User.ApprovalStatus.PENDING);

        userCommandService.reject(id, "부적합");

        verify(user).reject("부적합");
    }

    // ───────────── 차단 / 삭제 ─────────────

    @Test
    @DisplayName("차단 - PENDING 회원은 반려 처리 후 비활성화하고 토큰을 삭제한다")
    void disable_pendingAlsoRejected() {
        UUID id = UUID.randomUUID();
        User user = mock(User.class);
        given(userQueryService.findById(id)).willReturn(user);
        given(user.getApprovalStatus()).willReturn(User.ApprovalStatus.PENDING);

        userCommandService.disable(id);

        verify(user).reject(isNull());
        verify(user).disable();
        verify(refreshTokenRepository).deleteByUser(user);
    }

    @Test
    @DisplayName("차단 - 일반 회원은 반려 없이 비활성화하고 토큰을 삭제한다")
    void disable_approvedNoReject() {
        UUID id = UUID.randomUUID();
        User user = mock(User.class);
        given(userQueryService.findById(id)).willReturn(user);
        given(user.getApprovalStatus()).willReturn(User.ApprovalStatus.APPROVED);

        userCommandService.disable(id);

        verify(user, never()).reject(any());
        verify(user).disable();
        verify(refreshTokenRepository).deleteByUser(user);
    }

    @Test
    @DisplayName("삭제 - 논리 삭제 후 RefreshToken을 제거한다")
    void delete_removesToken() {
        UUID id = UUID.randomUUID();
        User user = mock(User.class);
        given(userQueryService.findById(id)).willReturn(user);

        userCommandService.delete(id);

        verify(user).delete();
        verify(refreshTokenRepository).deleteByUser(user);
    }

    @Test
    @DisplayName("로그아웃 - 사용자의 RefreshToken을 삭제한다")
    void logout_removesToken() {
        User user = mock(User.class);
        given(userQueryService.findByEmail("u@test.com")).willReturn(user);

        userCommandService.logout("u@test.com");

        verify(refreshTokenRepository).deleteByUser(user);
    }

    // ───────────── TOTP ─────────────

    @Test
    @DisplayName("TOTP 활성화 - QR 미발급(secret null)이면 InvalidInputException")
    void enableTotp_noSecret() {
        User user = mock(User.class);
        given(jwtTokenProvider.getEmailFromPreAuthToken("pre")).willReturn("u@test.com");
        given(userQueryService.findByEmail("u@test.com")).willReturn(user);
        given(user.getTotpSecret()).willReturn(null);

        assertThatThrownBy(() -> userCommandService.enableTotpAndGetUser("pre", "123456"))
                .isInstanceOf(InvalidInputException.class);
        verify(user, never()).enableTotp();
    }

    @Test
    @DisplayName("TOTP 활성화 - 코드가 틀리면 InvalidInputException")
    void enableTotp_wrongCode() {
        User user = mock(User.class);
        given(jwtTokenProvider.getEmailFromPreAuthToken("pre")).willReturn("u@test.com");
        given(userQueryService.findByEmail("u@test.com")).willReturn(user);
        given(user.getTotpSecret()).willReturn("SECRET");
        given(totpService.verifyCode("SECRET", "000000")).willReturn(false);

        assertThatThrownBy(() -> userCommandService.enableTotpAndGetUser("pre", "000000"))
                .isInstanceOf(InvalidInputException.class);
        verify(user, never()).enableTotp();
    }

    @Test
    @DisplayName("TOTP 활성화 - 코드가 맞으면 활성화하고 사용자를 반환한다")
    void enableTotp_success() {
        User user = mock(User.class);
        given(jwtTokenProvider.getEmailFromPreAuthToken("pre")).willReturn("u@test.com");
        given(userQueryService.findByEmail("u@test.com")).willReturn(user);
        given(user.getTotpSecret()).willReturn("SECRET");
        given(totpService.verifyCode("SECRET", "123456")).willReturn(true);

        User result = userCommandService.enableTotpAndGetUser("pre", "123456");

        verify(user).enableTotp();
        assertThat(result).isSameAs(user);
    }

    @Test
    @DisplayName("TOTP 검증 - 코드가 틀리면 InvalidInputException")
    void verifyTotp_wrongCode() {
        User user = mock(User.class);
        given(jwtTokenProvider.getEmailFromPreAuthToken("pre")).willReturn("u@test.com");
        given(userQueryService.findByEmail("u@test.com")).willReturn(user);
        given(user.getTotpSecret()).willReturn("SECRET");
        given(totpService.verifyCode("SECRET", "000000")).willReturn(false);

        assertThatThrownBy(() -> userCommandService.verifyTotpAndGetUser("pre", "000000"))
                .isInstanceOf(InvalidInputException.class);
    }

    @Test
    @DisplayName("TOTP 검증 - 코드가 맞으면 사용자를 반환한다")
    void verifyTotp_success() {
        User user = mock(User.class);
        given(jwtTokenProvider.getEmailFromPreAuthToken("pre")).willReturn("u@test.com");
        given(userQueryService.findByEmail("u@test.com")).willReturn(user);
        given(user.getTotpSecret()).willReturn("SECRET");
        given(totpService.verifyCode("SECRET", "123456")).willReturn(true);

        User result = userCommandService.verifyTotpAndGetUser("pre", "123456");

        assertThat(result).isSameAs(user);
    }
}
