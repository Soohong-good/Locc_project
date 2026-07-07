package com.example.locc.domain.social.service;

import com.example.locc.domain.social.dto.request.SocialAdditionalInfoRequest;
import com.example.locc.domain.user.entity.AuthProvider;
import com.example.locc.domain.user.entity.SocialAccount;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.SocialAccountRepository;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

/**
 * SocialRegistrationService 단위 테스트 (Mockito, DB 불필요)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("SocialRegistrationService 단위 테스트")
class SocialRegistrationServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private SocialAccountRepository socialAccountRepository;
    @Mock private JwtTokenProvider jwtTokenProvider;

    @InjectMocks private SocialRegistrationService socialRegistrationService;

    private SocialAdditionalInfoRequest.SocialAdditionalInfoRequestBuilder baseRequest() {
        return SocialAdditionalInfoRequest.builder()
                .name("홍길동").gender("M").phoneNumber("010-1234-5678")
                .userType("REGISTERED").agreedToTerms(true).agreedToPrivacy(true);
    }

    @Test
    @DisplayName("추가정보 입력 완료 - 미등록교인인데 가입 경로가 없으면 IllegalArgumentException")
    void completeSocialRegistration_unregisteredWithoutPath() {
        given(jwtTokenProvider.getEmailFromOAuthTemp("token")).willReturn("new@test.com");
        SocialAdditionalInfoRequest request = baseRequest().userType("UNREGISTERED").registrationPath(null).build();

        assertThatThrownBy(() -> socialRegistrationService.completeSocialRegistration("token", request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("가입 경로");
    }

    @Test
    @DisplayName("추가정보 입력 완료 - 신규 유저 + provider 정보 있으면 User와 SocialAccount를 모두 저장한다")
    void completeSocialRegistration_newUserWithProvider() {
        given(jwtTokenProvider.getEmailFromOAuthTemp("token")).willReturn("new@test.com");
        given(jwtTokenProvider.getProviderFromOAuthTemp("token")).willReturn("KAKAO");
        given(jwtTokenProvider.getProviderIdFromOAuthTemp("token")).willReturn("kakao-id-1");
        given(userRepository.findByEmail("new@test.com")).willReturn(Optional.empty());

        SocialAdditionalInfoRequest request = baseRequest().build();
        socialRegistrationService.completeSocialRegistration("token", request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getPhoneNumber()).isEqualTo("010-1234-5678");

        ArgumentCaptor<SocialAccount> socialCaptor = ArgumentCaptor.forClass(SocialAccount.class);
        verify(socialAccountRepository).save(socialCaptor.capture());
        assertThat(socialCaptor.getValue().getProvider()).isEqualTo(AuthProvider.KAKAO);
    }

    @Test
    @DisplayName("추가정보 입력 완료 - 신규 유저 + provider 정보 없으면 SocialAccount는 저장하지 않는다")
    void completeSocialRegistration_newUserWithoutProvider() {
        given(jwtTokenProvider.getEmailFromOAuthTemp("token")).willReturn("new@test.com");
        given(jwtTokenProvider.getProviderFromOAuthTemp("token")).willReturn(null);
        given(jwtTokenProvider.getProviderIdFromOAuthTemp("token")).willReturn(null);
        given(userRepository.findByEmail("new@test.com")).willReturn(Optional.empty());

        socialRegistrationService.completeSocialRegistration("token", baseRequest().build());

        verify(userRepository).save(any(User.class));
        verify(socialAccountRepository, never()).save(any());
    }

    @Test
    @DisplayName("추가정보 입력 완료 - 이미 회원가입이 완료된 계정(phoneNumber 있음)이면 IllegalStateException")
    void completeSocialRegistration_alreadyCompleted() {
        given(jwtTokenProvider.getEmailFromOAuthTemp("token")).willReturn("existing@test.com");
        given(jwtTokenProvider.getProviderFromOAuthTemp("token")).willReturn(null);
        given(jwtTokenProvider.getProviderIdFromOAuthTemp("token")).willReturn(null);
        User existing = mock(User.class);
        given(existing.getPhoneNumber()).willReturn("010-0000-0000");
        given(userRepository.findByEmail("existing@test.com")).willReturn(Optional.of(existing));

        assertThatThrownBy(() -> socialRegistrationService.completeSocialRegistration("token", baseRequest().build()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("이미 회원가입");
    }

    @Test
    @DisplayName("추가정보 입력 완료 - 소셜 로그인 계정이 아니면 IllegalStateException")
    void completeSocialRegistration_notOAuthUser() {
        given(jwtTokenProvider.getEmailFromOAuthTemp("token")).willReturn("existing@test.com");
        given(jwtTokenProvider.getProviderFromOAuthTemp("token")).willReturn(null);
        given(jwtTokenProvider.getProviderIdFromOAuthTemp("token")).willReturn(null);
        User existing = mock(User.class);
        given(existing.getPhoneNumber()).willReturn(null);
        given(existing.isOAuthUser()).willReturn(false);
        given(userRepository.findByEmail("existing@test.com")).willReturn(Optional.of(existing));

        assertThatThrownBy(() -> socialRegistrationService.completeSocialRegistration("token", baseRequest().build()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("소셜 로그인 계정이 아닙니다");
    }

    @Test
    @DisplayName("추가정보 입력 완료 - 기존 임시 소셜 계정이면 정보를 갱신하고 저장은 다시 호출하지 않는다")
    void completeSocialRegistration_existingOAuthUser() {
        given(jwtTokenProvider.getEmailFromOAuthTemp("token")).willReturn("existing@test.com");
        given(jwtTokenProvider.getProviderFromOAuthTemp("token")).willReturn(null);
        given(jwtTokenProvider.getProviderIdFromOAuthTemp("token")).willReturn(null);
        User existing = mock(User.class);
        given(existing.getPhoneNumber()).willReturn(null);
        given(existing.isOAuthUser()).willReturn(true);
        given(userRepository.findByEmail("existing@test.com")).willReturn(Optional.of(existing));

        socialRegistrationService.completeSocialRegistration("token", baseRequest().build());

        verify(existing).completeOAuthRegistration(
                "홍길동", null, "010-1234-5678", null, "M", null, null, true, true);
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("소셜 계정 연결 - provider 정보가 없으면 IllegalStateException")
    void linkSocialAccount_missingProviderInfo() {
        given(jwtTokenProvider.getEmailFromOAuthTemp("link-token")).willReturn("user@test.com");
        given(jwtTokenProvider.getProviderFromOAuthTemp("link-token")).willReturn(null);

        assertThatThrownBy(() -> socialRegistrationService.linkSocialAccount("link-token", "user@test.com"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("잘못된 연결 토큰");
    }

    @Test
    @DisplayName("소셜 계정 연결 - 토큰 이메일과 로그인한 이메일이 다르면 IllegalStateException")
    void linkSocialAccount_emailMismatch() {
        given(jwtTokenProvider.getEmailFromOAuthTemp("link-token")).willReturn("token@test.com");
        given(jwtTokenProvider.getProviderFromOAuthTemp("link-token")).willReturn("KAKAO");
        given(jwtTokenProvider.getProviderIdFromOAuthTemp("link-token")).willReturn("kakao-id-1");

        assertThatThrownBy(() -> socialRegistrationService.linkSocialAccount("link-token", "other@test.com"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("일치하지 않습니다");
    }

    @Test
    @DisplayName("소셜 계정 연결 - 이미 연결된 소셜 계정이면 IllegalStateException")
    void linkSocialAccount_alreadyLinked() {
        given(jwtTokenProvider.getEmailFromOAuthTemp("link-token")).willReturn("user@test.com");
        given(jwtTokenProvider.getProviderFromOAuthTemp("link-token")).willReturn("KAKAO");
        given(jwtTokenProvider.getProviderIdFromOAuthTemp("link-token")).willReturn("kakao-id-1");
        given(socialAccountRepository.findByProviderAndProviderId(AuthProvider.KAKAO, "kakao-id-1"))
                .willReturn(Optional.of(mock(SocialAccount.class)));

        assertThatThrownBy(() -> socialRegistrationService.linkSocialAccount("link-token", "user@test.com"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("이미 연결된");
    }

    @Test
    @DisplayName("소셜 계정 연결 - 사용자를 찾을 수 없으면 IllegalStateException")
    void linkSocialAccount_userNotFound() {
        given(jwtTokenProvider.getEmailFromOAuthTemp("link-token")).willReturn("user@test.com");
        given(jwtTokenProvider.getProviderFromOAuthTemp("link-token")).willReturn("KAKAO");
        given(jwtTokenProvider.getProviderIdFromOAuthTemp("link-token")).willReturn("kakao-id-1");
        given(socialAccountRepository.findByProviderAndProviderId(AuthProvider.KAKAO, "kakao-id-1"))
                .willReturn(Optional.empty());
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> socialRegistrationService.linkSocialAccount("link-token", "user@test.com"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("사용자를 찾을 수 없습니다");
    }

    @Test
    @DisplayName("소셜 계정 연결 - 정상 케이스면 계정 전환 후 SocialAccount가 저장된다")
    void linkSocialAccount_success() {
        given(jwtTokenProvider.getEmailFromOAuthTemp("link-token")).willReturn("user@test.com");
        given(jwtTokenProvider.getProviderFromOAuthTemp("link-token")).willReturn("KAKAO");
        given(jwtTokenProvider.getProviderIdFromOAuthTemp("link-token")).willReturn("kakao-id-1");
        given(socialAccountRepository.findByProviderAndProviderId(AuthProvider.KAKAO, "kakao-id-1"))
                .willReturn(Optional.empty());
        User user = mock(User.class);
        given(user.getName()).willReturn("홍길동");
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(user));

        socialRegistrationService.linkSocialAccount("link-token", "user@test.com");

        verify(user).convertToSocialLinked();
        ArgumentCaptor<SocialAccount> captor = ArgumentCaptor.forClass(SocialAccount.class);
        verify(socialAccountRepository).save(captor.capture());
        assertThat(captor.getValue().getProviderId()).isEqualTo("kakao-id-1");
    }
}
