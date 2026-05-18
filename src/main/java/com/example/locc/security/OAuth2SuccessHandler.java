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
 *   - 승인 대기 중:                       /social/pending  (email 파라미터 없음 — 계정 열거 방지)
 *   - 반려됨:                             /auth/login?error=rejected
 *   - 정상 로그인:                        app.oauth2-redirect-url (토큰은 쿠키로 전달)
 *
 * 토큰 전달 방식:
 *   - 정상 로그인: HttpOnly 쿠키 → JS 접근 불가, Referer 헤더로 유출 없음
 *   - tempToken (신규 사용자 임시): URL 파라미터 유지 — 10분 단기 토큰, 기능 제한
 *
 * 리다이렉트 URL 조합:
 *   - app.frontend-url 이 설정된 경우 해당 origin 사용 (권장)
 *   - 미설정 시 app.oauth2-redirect-url 에서 origin 추출 (fallback)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider       jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProperties          jwtProperties;
    private final AppProperties          appProperties;
    private final CookieUtil             cookieUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        Object principal = authentication.getPrincipal();
        User user;

        if (principal instanceof CustomOAuth2User) {
            user = ((CustomOAuth2User) principal).getUser();
        } else {
            log.error("OAuth2 Principal이 CustomOAuth2User 타입이 아닙니다: {}", principal.getClass());
            getRedirectStrategy().sendRedirect(request, response, resolveUrl("/auth/login?error=oauth2_error"));
            return;
        }

        log.debug("OAuth2 로그인 성공");

        // 신규 소셜 로그인 사용자 — 추가 정보 입력 필요
        if (user.getApprovalStatus() == User.ApprovalStatus.PENDING &&
                user.getPhoneNumber() == null) {
            log.debug("신규 소셜 로그인 사용자 - 추가 정보 입력 필요");
            String tempToken = jwtTokenProvider.generateOAuthTempToken(user.getEmail());
            getRedirectStrategy().sendRedirect(request, response,
                    resolveUrl("/social/register?tempToken=" + tempToken));
            return;
        }

        // 승인 대기 중
        if (user.getApprovalStatus() == User.ApprovalStatus.PENDING) {
            log.debug("승인 대기 중인 소셜 로그인 사용자");
            getRedirectStrategy().sendRedirect(request, response,
                    resolveUrl("/social/pending"));
            return;
        }

        // 반려된 계정
        if (user.getApprovalStatus() == User.ApprovalStatus.REJECTED) {
            log.warn("반려된 OAuth2 사용자 로그인 시도");
            getRedirectStrategy().sendRedirect(request, response,
                    resolveUrl("/auth/login?error=rejected"));
            return;
        }

        // 정상 로그인 — JWT를 HttpOnly 쿠키로 설정
        String accessToken  = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);
        saveOrUpdateRefreshToken(user, refreshToken);

        cookieUtil.addAccessTokenCookie(response, accessToken);
        cookieUtil.addRefreshTokenCookie(response, refreshToken);

        String redirectUrl = appProperties.getOauth2RedirectUrl();
        log.debug("OAuth2 로그인 완료 (쿠키 발급)");
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    // ───── private ─────

    /**
     * 프론트엔드 비정상 분기 리다이렉트 URL 조합
     *
     * oauth2RedirectUrl 에서 origin을 추출하는 방식은
     * 운영 환경에서 상대 경로(/oauth2/callback)로 설정 시 origin이 ""가 되어
     * 백엔드 포트(8080)로 리다이렉트되는 문제가 있다.
     *
     * frontendUrl을 우선 사용하고, 설정이 없으면 oauth2RedirectUrl에서 추출한다.
     */
    private String resolveUrl(String path) {
        String frontendUrl = appProperties.getFrontendUrl();
        if (frontendUrl != null && !frontendUrl.isBlank()) {
            return frontendUrl + path;
        }
        // frontendUrl 미설정 시 oauth2RedirectUrl에서 origin 추출 (fallback)
        String base = appProperties.getOauth2RedirectUrl();
        String origin = extractOrigin(base);
        return origin + path;
    }

    private String extractOrigin(String url) {
        if (url == null || url.startsWith("/")) {
            return "";
        }
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
