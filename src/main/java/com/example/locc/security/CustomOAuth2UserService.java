package com.example.locc.security;

import com.example.locc.domain.user.entity.AuthProvider;
import com.example.locc.domain.user.entity.SocialAccount;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.SocialAccountRepository;
import com.example.locc.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * OAuth2 사용자 정보 처리 서비스
 * - 소셜 로그인 후 사용자 정보 저장/업데이트
 * - SocialAccount를 통해 소셜 계정 연결 관리
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

        // 제공자별 사용자 정보 추출
        OAuth2UserInfo userInfo = getOAuth2UserInfo(registrationId, oAuth2User.getAttributes());
        
        if (userInfo == null) {
            throw new OAuth2AuthenticationException("지원하지 않는 OAuth2 제공자입니다.");
        }

        // AuthProvider enum으로 변환
        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());

        // 소셜 계정 조회
        SocialAccount socialAccount = socialAccountRepository
                .findByProviderAndProviderId(provider, userInfo.getProviderId())
                .orElse(null);

        User user;
        
        if (socialAccount != null) {
            // 기존 소셜 계정 존재 → 연결된 User 사용
            user = socialAccount.getUser();
            // 소셜 정보 업데이트 (이메일/이름이 변경될 수 있음)
            socialAccount.updateInfo(userInfo.getEmail(), userInfo.getName());
            log.info("기존 소셜 계정 정보 업데이트: {}", user.getEmail());
        } else {
            // 신규 소셜 로그인
            if (userInfo.getEmail() != null) {
                // 이메일이 있는 경우: 기존 User 찾기
                user = userRepository.findByEmail(userInfo.getEmail())
                        .orElseGet(() -> createNewUser(userInfo.getEmail(), userInfo.getName()));
            } else {
                // 이메일이 없는 경우: 임시 이메일로 User 생성 (추가 정보 입력에서 실제 이메일 받음)
                String tempEmail = provider.name().toLowerCase() + "_" + userInfo.getProviderId() + "@temp.local";
                user = createNewUser(tempEmail, userInfo.getName());
            }
            
            // SocialAccount 생성 및 연결
            SocialAccount newSocialAccount = SocialAccount.link(
                    provider,
                    userInfo.getProviderId(),
                    userInfo.getEmail(),
                    userInfo.getName(),
                    user
            );
            socialAccountRepository.save(newSocialAccount);
            log.info("신규 소셜 계정 연결 완료: {} - {}", provider, user.getEmail());
        }

        // User를 OAuth2User로 래핑하여 반환
        return createOAuth2User(user, oAuth2User.getAttributes(), registrationId);
    }

    /**
     * 제공자별 사용자 정보 추출
     */
    private OAuth2UserInfo getOAuth2UserInfo(String registrationId, Map<String, Object> attributes) {
        if ("kakao".equals(registrationId)) {
            return new KakaoUserInfo(attributes);
        } else if ("naver".equals(registrationId)) {
            return new NaverUserInfo(attributes);
        }
        return null;
    }

    /**
     * 신규 사용자 생성
     */
    private User createNewUser(String email, String name) {
        log.info("신규 OAuth2 사용자 생성: {}", email);
        
        User user = User.createOAuthTemporaryUser(email, name);
        return userRepository.save(user);
    }

    /**
     * User를 OAuth2User로 래핑
     */
    private OAuth2User createOAuth2User(User user, Map<String, Object> attributes, String registrationId) {
        Map<String, Object> modifiedAttributes = new HashMap<>(attributes);
        modifiedAttributes.put("email", user.getEmail());
        modifiedAttributes.put("name", user.getName());
        
        String nameAttributeKey = getNameAttributeKey(registrationId);
        
        return new CustomOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())),
                modifiedAttributes,
                nameAttributeKey,
                user
        );
    }

    /**
     * 제공자별 nameAttributeKey 반환
     */
    private String getNameAttributeKey(String registrationId) {
        if ("kakao".equals(registrationId)) {
            return "id";
        } else if ("naver".equals(registrationId)) {
            return "response";
        }
        return "id";
    }
}
