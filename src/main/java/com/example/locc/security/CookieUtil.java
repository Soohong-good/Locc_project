package com.example.locc.security;

import com.example.locc.config.AppProperties;
import com.example.locc.config.JwtProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Optional;

/**
 * JWT HttpOnly 쿠키 생성 / 삭제 유틸
 *
 * 쿠키 정책:
 *   - HttpOnly: true  → JS에서 접근 불가 (XSS 방어)
 *   - Secure:   운영=true / 개발=false  (app.cookie-secure 설정)
 *   - SameSite: Lax   → CSRF 방어 (GET 요청 제외, POST 등 cross-site 차단)
 *   - Path:     /
 *
 * SameSite=Strict 대신 Lax를 선택한 이유:
 *   OAuth2 리다이렉트(GET)가 cross-site로 들어오므로 Strict이면 쿠키 미전송
 */
@Component
@RequiredArgsConstructor
public class CookieUtil {

    public static final String ACCESS_TOKEN_COOKIE  = "accessToken";
    public static final String REFRESH_TOKEN_COOKIE = "refreshToken";

    private final AppProperties     appProperties;
    private final JwtProperties     jwtProperties;
    private final JwtTokenProvider  jwtTokenProvider;

    // ───── 쿠키 추가 ─────

    /**
     * Access Token HttpOnly 쿠키 설정
     */
    public void addAccessTokenCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = buildCookie(
                ACCESS_TOKEN_COOKIE,
                token,
                maxAgeFromToken(token, jwtProperties.getExpiration())
        );
        response.addHeader("Set-Cookie", cookie.toString());
    }

    /**
     * Refresh Token HttpOnly 쿠키 설정
     */
    public void addRefreshTokenCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = buildCookie(
                REFRESH_TOKEN_COOKIE,
                token,
                maxAgeFromToken(token, jwtProperties.getRefreshExpiration())
        );
        response.addHeader("Set-Cookie", cookie.toString());
    }

    /**
     * 쿠키 maxAge(초)를 토큰 자체의 만료시각에서 도출.
     * - 역할별 만료(관리자 30분 등)가 토큰에 이미 반영돼 있으므로 쿠키 수명도 자동 일치
     * - 파싱 실패 시 전역 기본값(ms)으로 폴백
     */
    private int maxAgeFromToken(String token, long fallbackMs) {
        try {
            long remainMs = jwtTokenProvider.extractExpiration(token).getTime() - System.currentTimeMillis();
            if (remainMs > 0) return (int) (remainMs / 1000);
        } catch (RuntimeException ignored) {
            // 폴백 사용
        }
        return (int) (fallbackMs / 1000);
    }

    // ───── 쿠키 삭제 ─────

    /**
     * Access Token + Refresh Token 쿠키 동시 삭제 (로그아웃용)
     */
    public void clearAuthCookies(HttpServletResponse response) {
        response.addHeader("Set-Cookie", buildExpiredCookie(ACCESS_TOKEN_COOKIE).toString());
        response.addHeader("Set-Cookie", buildExpiredCookie(REFRESH_TOKEN_COOKIE).toString());
    }

    // ───── 쿠키 읽기 ─────

    /**
     * 요청에서 특정 이름의 쿠키 값 추출
     */
    public Optional<String> getCookieValue(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return Optional.empty();
        return Arrays.stream(request.getCookies())
                .filter(c -> name.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }

    // ───── private ─────

    private ResponseCookie buildCookie(String name, String value, int maxAgeSeconds) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(appProperties.isCookieSecure())
                .sameSite("Lax")
                .path("/")
                .maxAge(maxAgeSeconds)
                .build();
    }

    private ResponseCookie buildExpiredCookie(String name) {
        return ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(appProperties.isCookieSecure())
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
    }
}
