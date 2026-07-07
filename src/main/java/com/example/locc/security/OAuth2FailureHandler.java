package com.example.locc.security;

import com.example.locc.config.AppProperties;
import com.example.locc.exception.EmailConflictException;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * OAuth2 로그인 실패 핸들러
 *
 * 실패 케이스별 프론트 redirect 정책:
 *   - 소셜 이메일이 기존 일반 계정과 충돌:   /social/email-conflict?linkToken=...
 *     (linkToken: 기존 계정 로그인 후 소셜 계정 연결을 완료하는 데 쓰이는 10분 단기 토큰)
 *   - 사용자가 소셜 로그인 동의를 취소함: /login?error=access_denied
 *   - 그 외 오류:                        /login?error=oauth2_error
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2FailureHandler extends SimpleUrlAuthenticationFailureHandler {

    private final AppProperties appProperties;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException exception)
            throws IOException, ServletException {

        log.error("OAuth2 로그인 실패: {}", exception.getMessage());

        if (exception instanceof EmailConflictException conflictException) {
            String linkToken = jwtTokenProvider.generateOAuthTempToken(
                    conflictException.getEmail(), conflictException.getProvider(), conflictException.getProviderId());
            getRedirectStrategy().sendRedirect(request, response,
                    resolveUrl("/social/email-conflict?linkToken=" + linkToken));
            return;
        }

        String errorCode = "oauth2_error";
        if (exception instanceof OAuth2AuthenticationException oAuth2Exception
                && "access_denied".equals(oAuth2Exception.getError().getErrorCode())) {
            errorCode = "access_denied";
        }

        getRedirectStrategy().sendRedirect(request, response, resolveUrl("/login?error=" + errorCode));
    }

    private String resolveUrl(String path) {
        String frontendUrl = appProperties.getFrontendUrl();
        if (frontendUrl != null && !frontendUrl.isBlank()) {
            return frontendUrl + path;
        }
        String base = appProperties.getOauth2RedirectUrl();
        return extractOrigin(base) + path;
    }

    private String extractOrigin(String url) {
        if (url == null || url.startsWith("/")) return "";
        try {
            java.net.URI uri = java.net.URI.create(url);
            return uri.getScheme() + "://" + uri.getAuthority();
        } catch (Exception e) {
            return "";
        }
    }
}
