package com.example.locc.security;

import com.example.locc.config.AppProperties;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * OAuth2 로그인 실패 핸들러
 *
 * 실패 케이스별 프론트 redirect 정책:
 *   - 그 외 오류: /login?error=oauth2_error
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2FailureHandler extends SimpleUrlAuthenticationFailureHandler {

    private final AppProperties appProperties;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException exception)
            throws IOException, ServletException {

        log.error("OAuth2 로그인 실패: {}", exception.getMessage());
        getRedirectStrategy().sendRedirect(request, response, resolveUrl("/login?error=oauth2_error"));
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
