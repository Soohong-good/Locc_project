package com.example.locc.domain.social.service;

import com.example.locc.domain.social.dto.request.SocialAdditionalInfoRequest;
import com.example.locc.domain.user.entity.AuthProvider;
import com.example.locc.domain.user.entity.SocialAccount;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.SocialAccountRepository;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 소셜 로그인 추가 회원가입 서비스
 *
 * [신규 플로우]
 * OAuth2 인증 시 DB 저장 없음 → 폼 완료 시점에 User + SocialAccount 최초 저장
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SocialRegistrationService {

    private final UserRepository         userRepository;
    private final SocialAccountRepository socialAccountRepository;
    private final JwtTokenProvider       jwtTokenProvider;

    /**
     * 소셜 추가 정보 입력으로 회원가입 완료
     * - 신규 플로우: token에 provider/providerId 포함 → User + SocialAccount 최초 DB 저장
     */
    @Transactional
    public void completeSocialRegistration(String token, SocialAdditionalInfoRequest request) {
        log.info("소셜 추가 정보 입력 시작");

        String email      = jwtTokenProvider.getEmailFromOAuthTemp(token);
        String providerStr = jwtTokenProvider.getProviderFromOAuthTemp(token);
        String providerId  = jwtTokenProvider.getProviderIdFromOAuthTemp(token);

        // UserType 변환
        User.UserType userType = "REGISTERED".equals(request.getUserType())
                ? User.UserType.REGISTERED
                : User.UserType.UNREGISTERED;

        // 미등록교인 가입 경로 필수 검증
        if (userType == User.UserType.UNREGISTERED &&
                (request.getRegistrationPath() == null || request.getRegistrationPath().isBlank())) {
            throw new IllegalArgumentException("미등록교인은 가입 경로가 필수입니다.");
        }

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // ── 신규 플로우: 폼 완료 시 최초 DB 저장 ──────────────────
            user = User.createOAuthTemporaryUser(email, request.getName());
            user.changeUserType(userType);
            user.completeOAuthRegistration(
                    request.getName(), null, request.getPhoneNumber(),
                    request.getBirth(), request.getGender(), request.getAddress(),
                    request.getRegistrationPath(),
                    request.getAgreedToTerms(), request.getAgreedToPrivacy()
            );
            userRepository.save(user);

            if (providerStr != null && providerId != null) {
                AuthProvider authProvider = AuthProvider.valueOf(providerStr);
                SocialAccount socialAccount = SocialAccount.link(
                        authProvider, providerId, email, request.getName(), user);
                socialAccountRepository.save(socialAccount);
            }

        } else {
            // ── 구 플로우 호환: 이미 DB에 임시 계정이 있는 경우 ────────
            if (user.getPhoneNumber() != null) {
                throw new IllegalStateException("이미 회원가입이 완료된 계정입니다.");
            }
            if (!user.isOAuthUser()) {
                throw new IllegalStateException("소셜 로그인 계정이 아닙니다.");
            }
            user.changeUserType(userType);
            user.completeOAuthRegistration(
                    request.getName(), null, request.getPhoneNumber(),
                    request.getBirth(), request.getGender(), request.getAddress(),
                    request.getRegistrationPath(),
                    request.getAgreedToTerms(), request.getAgreedToPrivacy()
            );
        }

        log.info("소셜 추가 정보 입력 완료");
    }
}
