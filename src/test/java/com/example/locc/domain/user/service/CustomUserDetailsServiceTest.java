package com.example.locc.domain.user.service;

import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;

/**
 * CustomUserDetailsService 단위 테스트 (Mockito, DB 불필요)
 * - Spring Security 인증 로드 시 분기(미존재/소셜전용/정상)를 검증한다.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("CustomUserDetailsService 단위 테스트")
class CustomUserDetailsServiceTest {

    @Mock private UserRepository userRepository;

    @InjectMocks private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("로그인 로드 - 이메일이 없으면 UsernameNotFoundException")
    void loadUserByUsername_notFound() {
        given(userRepository.findByEmail("ghost@test.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> customUserDetailsService.loadUserByUsername("ghost@test.com"))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    @DisplayName("로그인 로드 - 소셜 전용 계정(비밀번호 null)이면 BadCredentialsException")
    void loadUserByUsername_socialOnly() {
        User user = mock(User.class);
        given(userRepository.findByEmail("social@test.com")).willReturn(Optional.of(user));
        given(user.getPassword()).willReturn(null);

        assertThatThrownBy(() -> customUserDetailsService.loadUserByUsername("social@test.com"))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    @DisplayName("로그인 로드 - 정상 계정이면 UserDetails(User)를 반환한다")
    void loadUserByUsername_success() {
        User user = mock(User.class);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(user));
        given(user.getPassword()).willReturn("encodedPassword");

        UserDetails result = customUserDetailsService.loadUserByUsername("user@test.com");

        assertThat(result).isSameAs(user);
    }
}
