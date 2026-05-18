package com.example.locc.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;

/**
 * OAuth2 Authorization Request 세션 저장소 (커스텀)
 *
 * 기본 HttpSessionOAuth2AuthorizationRequestRepository를 대체.
 * LinkModeInfo(연결 모드 정보)를 세션에서 보존하는 역할.
 *
 * 동작:
 *   - saveAuthorizationRequest: OAuth2 인증 요청을 세션에 저장
 *     (removeAuthorizationRequest 에서 LinkModeInfo를 제거하지 않음)
 *   - removeAuthorizationRequest: 인증 요청만 제거 (LinkModeInfo는 유지)
 *   - loadAuthorizationRequest: 세션에서 인증 요청 조회
 */
@Component
public class CustomOAuth2AuthorizationRequestRepository
        implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    private static final String AUTHORIZATION_REQUEST_KEY = "OAUTH2_AUTHORIZATION_REQUEST";

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return null;
        return (OAuth2AuthorizationRequest) session.getAttribute(AUTHORIZATION_REQUEST_KEY);
    }

    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest,
                                         HttpServletRequest request,
                                         HttpServletResponse response) {
        if (authorizationRequest == null) {
            removeAuthorizationRequest(request, response);
            return;
        }
        request.getSession().setAttribute(AUTHORIZATION_REQUEST_KEY, authorizationRequest);
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request,
                                                                  HttpServletResponse response) {
        HttpSession session = request.getSession(false);
        if (session == null) return null;

        OAuth2AuthorizationRequest authorizationRequest =
                (OAuth2AuthorizationRequest) session.getAttribute(AUTHORIZATION_REQUEST_KEY);

        // 인증 요청은 제거하되, LinkModeInfo는 콜백에서 사용해야 하므로 유지
        session.removeAttribute(AUTHORIZATION_REQUEST_KEY);

        return authorizationRequest;
    }
}
