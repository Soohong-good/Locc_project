package com.example.locc.domain.user.service;

import com.example.locc.domain.user.dto.command.UserUpdateCommand;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.exception.NotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

/**
 * UserMyPageService 단위 테스트 (Mockito, DB 불필요)
 * - 프로필 수정·비밀번호 변경의 검증 로직(소셜계정 차단, 현재비번 확인)을 검증한다.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserMyPageService 단위 테스트")
class UserMyPageServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks private UserMyPageService userMyPageService;

    // ───────────── 조회 ─────────────

    @Test
    @DisplayName("상세정보 조회 - 사용자가 없으면 NotFoundException")
    void getUserInfo_notFound() {
        given(userRepository.findByEmailWithSocialAccounts("ghost@test.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> userMyPageService.getUserInfo("ghost@test.com"))
                .isInstanceOf(NotFoundException.class);
    }

    // ───────────── 프로필 수정 ─────────────

    @Test
    @DisplayName("프로필 수정 - 사용자가 없으면 NotFoundException")
    void updateProfile_notFound() {
        UserUpdateCommand command = mock(UserUpdateCommand.class);
        given(userRepository.findByEmail("ghost@test.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> userMyPageService.updateProfile("ghost@test.com", command))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("프로필 수정 - 정상 시 엔티티의 update를 호출한다")
    void updateProfile_callsUpdate() {
        User user = mock(User.class);
        UserUpdateCommand command = mock(UserUpdateCommand.class);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(user));

        userMyPageService.updateProfile("user@test.com", command);

        verify(user).update(command);
    }

    // ───────────── 비밀번호 변경 ─────────────

    @Test
    @DisplayName("비밀번호 변경 - 사용자가 없으면 NotFoundException")
    void changePassword_notFound() {
        given(userRepository.findByEmail("ghost@test.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> userMyPageService.changePassword("ghost@test.com", "cur", "new"))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("비밀번호 변경 - 소셜 전용 계정이면 IllegalStateException")
    void changePassword_oauthUser() {
        User user = mock(User.class);
        given(userRepository.findByEmail("social@test.com")).willReturn(Optional.of(user));
        given(user.isOAuthUser()).willReturn(true);

        assertThatThrownBy(() -> userMyPageService.changePassword("social@test.com", "cur", "new"))
                .isInstanceOf(IllegalStateException.class);

        verify(user, never()).changePassword(org.mockito.ArgumentMatchers.anyString());
    }

    @Test
    @DisplayName("비밀번호 변경 - 현재 비밀번호가 틀리면 IllegalArgumentException")
    void changePassword_wrongCurrent() {
        User user = mock(User.class);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(user));
        given(user.isOAuthUser()).willReturn(false);
        given(user.getPassword()).willReturn("encodedOld");
        given(passwordEncoder.matches("wrong", "encodedOld")).willReturn(false);

        assertThatThrownBy(() -> userMyPageService.changePassword("user@test.com", "wrong", "new"))
                .isInstanceOf(IllegalArgumentException.class);

        verify(user, never()).changePassword(org.mockito.ArgumentMatchers.anyString());
    }

    @Test
    @DisplayName("비밀번호 변경 - 정상 시 새 비밀번호를 인코딩해 변경한다")
    void changePassword_success() {
        User user = mock(User.class);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(user));
        given(user.isOAuthUser()).willReturn(false);
        given(user.getPassword()).willReturn("encodedOld");
        given(passwordEncoder.matches("current", "encodedOld")).willReturn(true);
        given(passwordEncoder.encode("newpass")).willReturn("encodedNew");

        assertThatCode(() -> userMyPageService.changePassword("user@test.com", "current", "newpass"))
                .doesNotThrowAnyException();

        verify(user).changePassword("encodedNew");
    }
}
