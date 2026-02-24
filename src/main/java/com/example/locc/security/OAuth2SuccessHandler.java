package com.example.locc.security;

import com.example.locc.config.AppProperties;
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
 *
 * 리다이렉트 URL 정책:
 *   - 신규 소셜 사용자 (추가 정보 미입력): /social/register?tempToken=...
 *   - 승인 대기 중:                       /social/pending?email=...
 *   - 반려됨:                             /auth/login?error=rejected
 *   - 정상 로그인:                        app.oauth2-redirect-url?accessToken=...&refreshToken=...
 *
 * app.oauth2-redirect-url 설정:
 *   - 개발: http://localhost:3000/oauth2/callback
 *   - 운영: https://yourdomain.com/oauth2/callback
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProperties jwtProperties;
    private final AppProperties appProperties;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        Object principal = authentication.getPrincipal();
        User user;

        if (principal instanceof CustomOAuth2User) {
            user = ((CustomOAuth2User) principal).getUser();
        } else {
            log.error("OAuth2 Principal이 CustomOAuth2User 타입이 아닙니다: {}", principal.getClass());
            getRedirectStrategy().sendRedirect(request, response, resolveErrorUrl("/auth/login?error=oauth2_error"));
            return;
        }

        log.info("OAuth2 로그인 성공: {}", user.getEmail());

        // 신규 소셜 로그인 사용자 — 추가 정보 입력 필요
        if (user.getApprovalStatus() == User.ApprovalStatus.PENDING &&
                user.getPhoneNumber() == null) {
            log.info("신규 소셜 로그인 사용자 - 추가 정보 입력 필요: {}", user.getEmail());
            String tempToken = jwtTokenProvider.generateOAuthTempToken(user.getEmail());
            getRedirectStrategy().sendRedirect(request, response,
                    resolveUrl("/social/register?tempToken=" + tempToken));
            return;
        }

        // 승인 대기 중
        if (user.getApprovalStatus() == User.ApprovalStatus.PENDING) {
            log.info("승인 대기 중인 소셜 로그인 사용자: {}", user.getEmail());
            getRedirectStrategy().sendRedirect(request, response,
                    resolveUrl("/social/pending?email=" + user.getEmail()));
            return;
        }

        // 반려된 계정
        if (user.getApprovalStatus() == User.ApprovalStatus.REJECTED) {
            log.warn("반려된 OAuth2 사용자 로그인 시도: {}", user.getEmail());
            getRedirectStrategy().sendRedirect(request, response,
                    resolveErrorUrl("/auth/login?error=rejected"));
            return;
        }

        // 정상 로그인 — JWT 발급 후 프론트로 리다이렉트
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);
        saveOrUpdateRefreshToken(user, refreshToken);

        String redirectUrl = appProperties.getOauth2RedirectUrl()
                + "?accessToken=" + accessToken
                + "&refreshToken=" + refreshToken;

        log.info("OAuth2 로그인 완료, 리다이렉트: {}", user.getEmail());
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    // ───── private ─────

    /**
     * 프론트 baseUrl + 경로 조합
     * 운영(같은 도메인): baseUrl="" → 상대경로
     * 개발(포트 분리):  baseUrl="http://localhost:3000" → 절대경로
     */
    private String resolveUrl(String path) {
        String base = appProperties.getOauth2RedirectUrl();
        // oauth2RedirectUrl이 callback 경로면 base 앞부분(origin)만 추출
        String origin = extractOrigin(base);
        return origin + path;
    }

    private String resolveErrorUrl(String path) {
        String origin = extractOrigin(appProperties.getOauth2RedirectUrl());
        return origin + path;
    }

    private String extractOrigin(String url) {
        if (url == null || url.startsWith("/")) {
            return "";
        }
        // http://localhost:3000/oauth2/callback → http://localhost:3000
        try {
            java.net.URI uri = java.net.URI.create(url);
            return uri.getScheme() + "://" + uri.getAuthority();
        } catch (Exception e) {
            return "";
        }
    }

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
