package com.example.locc.security;

import com.example.locc.domain.user.entity.AuthProvider;
import com.example.locc.domain.user.entity.SocialAccount;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.SocialAccountRepository;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.exception.EmailConflictException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * OAuth2 사용자 정보 처리 서비스
 *
 * 소셜 로그인 처리 정책:
 *   1. 이미 소셜 계정으로 가입된 경우 → 기존 계정으로 로그인 (소셜 정보 업데이트)
 *   2. 소셜 이메일과 동일한 이메일의 일반 계정이 존재 → 자동 병합 금지, {@link com.example.locc.exception.EmailConflictException} 발생
 *      (비밀번호 검증 없이 자동 연결하면 이메일만 알아도 계정을 탈취할 수 있어 차단)
 *   3. 신규 사용자 → 임시 계정 생성 후 추가 정보 입력 페이지로 이동
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final SocialAccountRepository socialAccountRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        log.info("OAuth2 로그인 시도: {}", registrationId);

        OAuth2UserInfo userInfo = getOAuth2UserInfo(registrationId, oAuth2User.getAttributes());
        if (userInfo == null) {
            throw new OAuth2AuthenticationException("지원하지 않는 OAuth2 제공자입니다.");
        }

        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());
        return handleLoginMode(provider, userInfo, oAuth2User, registrationId);
    }

    // ─── 로그인 모드 ─────────────────────────────────────────────────────────

    private OAuth2User handleLoginMode(AuthProvider provider, OAuth2UserInfo userInfo,
                                       OAuth2User oAuth2User, String registrationId) {
        // 케이스 1: 이미 이 소셜 계정으로 가입된 경우 → 기존 계정 로그인
        SocialAccount socialAccount = socialAccountRepository
                .findByProviderAndProviderId(provider, userInfo.getProviderId())
                .orElse(null);

        if (socialAccount != null) {
            socialAccount.updateInfo(userInfo.getEmail(), userInfo.getName());
            log.debug("기존 소셜 계정 정보 업데이트");
            return createOAuth2User(socialAccount.getUser(), oAuth2User.getAttributes(), registrationId);
        }

        // 케이스 2: 소셜 이메일과 동일한 일반 계정 존재 → 자동 병합 금지, 충돌 안내 페이지로 차단
        if (userInfo.getEmail() != null) {
            User existingUser = userRepository.findByEmail(userInfo.getEmail()).orElse(null);

            if (existingUser != null) {
                log.warn("소셜 이메일과 일치하는 일반 계정 발견 → 자동 연결 차단: email={}, provider={}",
                        userInfo.getEmail(), provider);
                throw new EmailConflictException(userInfo.getEmail());
            }
        }

        // 케이스 3: 신규 사용자 → 폼 완료 시 DB 저장 (여기서는 저장하지 않음)
        String email = userInfo.getEmail() != null
                ? userInfo.getEmail()
                : provider.name().toLowerCase() + "_" + userInfo.getProviderId() + "@temp.local";

        User newUser = User.createOAuthTemporaryUser(email, userInfo.getName()); // DB 저장 안 함
        log.debug("신규 소셜 사용자 인증 완료 (DB 미저장): provider={}", provider);

        return createOAuth2User(newUser, oAuth2User.getAttributes(), registrationId,
                provider.name(), userInfo.getProviderId());
    }

    // ─── 공통 유틸 ───────────────────────────────────────────────────────────

    private OAuth2UserInfo getOAuth2UserInfo(String registrationId, Map<String, Object> attributes) {
        if ("kakao".equals(registrationId)) return new KakaoUserInfo(attributes);
        else if ("naver".equals(registrationId)) return new NaverUserInfo(attributes);
        return null;
    }

    private OAuth2User createOAuth2User(User user, Map<String, Object> attributes, String registrationId) {
        Map<String, Object> modifiedAttributes = new HashMap<>(attributes);
        modifiedAttributes.put("email", user.getEmail());
        modifiedAttributes.put("name", user.getName());
        return new CustomOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())),
                modifiedAttributes,
                getNameAttributeKey(registrationId),
                user
        );
    }

    /** 신규 사용자용 — provider/providerId를 attributes에 포함 */
    private OAuth2User createOAuth2User(User user, Map<String, Object> attributes, String registrationId,
                                        String provider, String providerId) {
        Map<String, Object> modifiedAttributes = new HashMap<>(attributes);
        modifiedAttributes.put("email", user.getEmail());
        modifiedAttributes.put("name", user.getName());
        modifiedAttributes.put("_oauth_provider", provider);
        modifiedAttributes.put("_oauth_providerId", providerId);
        return new CustomOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())),
                modifiedAttributes,
                getNameAttributeKey(registrationId),
                user
        );
    }

    private String getNameAttributeKey(String registrationId) {
        if ("kakao".equals(registrationId)) return "id";
        else if ("naver".equals(registrationId)) return "response";
        return "id";
    }
}
