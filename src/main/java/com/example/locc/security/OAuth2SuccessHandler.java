package com.example.locc.security;

import com.example.locc.config.JwtProperties;
import com.example.locc.domain.user.entity.RefreshToken;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.RefreshTokenRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

/**
 * OAuth2 로그인 성공 핸들러
 * - JWT 토큰 생성 및 리다이렉트
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProperties jwtProperties;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        
        // CustomOAuth2User에서 User 엔티티 추출
        Object principal = authentication.getPrincipal();
        User user;
        
        if (principal instanceof CustomOAuth2User) {
            user = ((CustomOAuth2User) principal).getUser();
        } else {
            log.error("OAuth2 Principal이 CustomOAuth2User 타입이 아닙니다: {}", principal.getClass());
            getRedirectStrategy().sendRedirect(request, response, "/auth/login?error=oauth2_error");
            return;
        }
        
        log.info("OAuth2 로그인 성공: {}", user.getEmail());

        // 신규 소셜 로그인 사용자 체크 (추가 정보 입력 필요)
        if (user.getApprovalStatus() == User.ApprovalStatus.PENDING && 
            user.getPhoneNumber() == null) {
            log.info("신규 소셜 로그인 사용자 - 추가 정보 입력 필요: {}", user.getEmail());
            
            // 소셜 임시 토큰 발급 (10분 유효, type=oauth_temp)
            String tempToken = jwtTokenProvider.generateOAuthTempToken(user.getEmail());
            
            getRedirectStrategy().sendRedirect(request, response, 
                "/social/register?tempToken=" + tempToken);
            return;
        }

        // 승인 대기 상태 체크 (추가 정보는 입력했지만 관리자 승인 전)
        if (user.getApprovalStatus() == User.ApprovalStatus.PENDING) {
            log.info("승인 대기 중인 소셜 로그인 사용자: {}", user.getEmail());
            getRedirectStrategy().sendRedirect(request, response, 
                "/social/pending?email=" + user.getEmail());
            return;
        }

        // 반려된 계정 체크
        if (user.getApprovalStatus() == User.ApprovalStatus.REJECTED) {
            log.warn("반려된 OAuth2 사용자 로그인 시도: {}", user.getEmail());
            getRedirectStrategy().sendRedirect(request, response, 
                "/auth/login?error=rejected");
            return;
        }

        // JWT 토큰 생성
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        // RefreshToken 저장
        saveOrUpdateRefreshToken(user, refreshToken);

        // 토큰을 쿼리 파라미터로 전달 (프론트엔드에서 localStorage에 저장)
        String redirectUrl = String.format("/?accessToken=%s&refreshToken=%s", accessToken, refreshToken);
        
        log.info("OAuth2 로그인 완료, 리다이렉트: {}", user.getEmail());
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    /**
     * RefreshToken 저장 또는 갱신
     */
    private void saveOrUpdateRefreshToken(User user, String token) {
        LocalDateTime expiresAt = LocalDateTime.now()
                .plusSeconds(jwtProperties.getRefreshExpiration() / 1000);

        refreshTokenRepository.findByUser(user)
                .ifPresentOrElse(
                        existingToken -> existingToken.refresh(token, expiresAt),
                        () -> {
                            RefreshToken newToken = RefreshToken.create(user, token, expiresAt);
                            refreshTokenRepository.save(newToken);
                        }
                );
    }
}
