package com.example.locc.domain.social.service;

import com.example.locc.domain.social.dto.request.SocialAdditionalInfoRequest;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 소셜 로그인 추가 회원가입 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SocialRegistrationService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 소셜 임시 토큰으로 사용자 조회
     */
    public User getUserByToken(String token) {
        String email = jwtTokenProvider.getEmailFromOAuthTemp(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    /**
     * 소셜 추가 정보 입력으로 회원가입 완료
     */
    @Transactional
    public void completeSocialRegistration(String token, SocialAdditionalInfoRequest request) {
        log.info("소셜 추가 정보 입력 시작");

        // 토큰으로 사용자 조회
        User user = getUserByToken(token);

        // 이미 추가 정보가 입력된 경우
        if (user.getPhoneNumber() != null) {
            throw new IllegalStateException("이미 회원가입이 완료된 계정입니다.");
        }

        // 소셜 로그인 계정이 아닌 경우
        if (!user.isOAuthUser()) {
            throw new IllegalStateException("소셜 로그인 계정이 아닙니다.");
        }

        // UserType 변환
        User.UserType userType = "REGISTERED".equals(request.getUserType())
                ? User.UserType.REGISTERED
                : User.UserType.UNREGISTERED;

        // UserType 설정
        user.changeUserType(userType);

        // 미등록교인인 경우에만 등록경로 필수 검증
        if (userType == User.UserType.UNREGISTERED &&
                (request.getRegistrationPath() == null || request.getRegistrationPath().isBlank())) {
            throw new IllegalArgumentException("미등록교인은 가입 경로가 필수입니다.");
        }

        // 추가 정보 입력
        user.completeOAuthRegistration(
                request.getName(),
                null, // username은 소셜 로그인에서 불필요
                request.getPhoneNumber(),
                request.getBirth(),
                request.getGender(),
                request.getAddress(),
                request.getRegistrationPath(),
                request.getAgreedToTerms(),
                request.getAgreedToPrivacy()
        );

        log.info("소셜 추가 정보 입력 완료: {}", user.getEmail());
    }
}
