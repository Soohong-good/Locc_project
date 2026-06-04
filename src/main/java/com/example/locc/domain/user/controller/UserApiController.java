package com.example.locc.domain.user.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.common.PageResponse;
import com.example.locc.domain.user.dto.request.CheckEmailRequest;
import com.example.locc.domain.user.dto.request.UserLoginRequest;
import com.example.locc.domain.user.dto.request.UserRegisterRequest;
import com.example.locc.domain.user.dto.response.UserAuthResponse;
import com.example.locc.domain.user.dto.response.UserDetailResponse;
import com.example.locc.domain.user.dto.response.UserResponse;
import com.example.locc.domain.user.service.UserCommandService;
import com.example.locc.domain.user.service.UserPermissionService;
import com.example.locc.domain.user.service.UserQueryService;
import com.example.locc.security.CookieUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * User API Controller
 * - 인증(Auth) + 사용자 관리 통합
 *
 * 토큰 전달 방식: HttpOnly 쿠키
 * - accessToken  쿠키: SameSite=Lax, HttpOnly, 만료시간 = JWT 설정값
 * - refreshToken 쿠키: SameSite=Lax, HttpOnly, 만료시간 = Refresh JWT 설정값
 * - 응답 바디에는 토큰을 포함하지 않는다 (XSS 방어)
 */
@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserApiController {

    private final UserCommandService  userCommandService;
    private final UserQueryService    userQueryService;
    private final UserPermissionService userPermissionService;
    private final CookieUtil         cookieUtil;

    // ===== 인증 관련 API =====

    @PostMapping("/auth/register")
    public ResponseEntity<ApiResponse<UserAuthResponse>> register(
            @Valid @RequestBody UserRegisterRequest request) {
        log.debug("Register request received");
        return ResponseEntity.ok(ApiResponse.ok(userCommandService.register(request.toCommand())));
    }

    /**
     * 이메일 중복 확인
     *
     * 계정 열거(Account Enumeration) 방지:
     *   - boolean 직접 반환 제거 → 중복 시 예외(400), 사용 가능 시 200 반환
     *   - GET → POST + @Valid DTO 방식으로 입력값 검증 강화
     *   - Rate Limit: 10회 / 1분 (RateLimitFilter)
     */
    @PostMapping("/auth/check-email")
    public ResponseEntity<ApiResponse<Void>> checkEmail(
            @Valid @RequestBody CheckEmailRequest request) {
        userQueryService.validateEmailAvailable(request.email());
        return ResponseEntity.ok(ApiResponse.ok(null, "사용 가능한 이메일입니다."));
    }

    /**
     * 로그인
     * - 토큰을 HttpOnly 쿠키로 설정
     * - 응답 바디의 accessToken / refreshToken 은 null (쿠키로만 전달)
     */
    @PostMapping("/auth/login")
    public ResponseEntity<ApiResponse<UserAuthResponse>> login(
            @Valid @RequestBody UserLoginRequest request,
            HttpServletResponse response) {
        log.debug("Login request received");

        UserAuthResponse auth = userCommandService.login(request.toCommand());

        // TOTP 2차 인증 필요 — JWT 쿠키 설정 없이 preAuthToken만 반환
        if (Boolean.TRUE.equals(auth.getTotpRequired())) {
            return ResponseEntity.ok(ApiResponse.ok(auth));
        }

        // HttpOnly 쿠키로 토큰 설정
        cookieUtil.addAccessTokenCookie(response, auth.getAccessToken());
        cookieUtil.addRefreshTokenCookie(response, auth.getRefreshToken());

        // 바디에서 토큰 제거 — 사용자 식별 정보만 반환
        return ResponseEntity.ok(ApiResponse.ok(auth.withoutTokens()));
    }

    /**
     * 토큰 갱신 (Refresh Token Rotation)
     * - 쿠키에서 refreshToken 자동 수신 (withCredentials)
     * - 새 accessToken + 새 refreshToken 을 HttpOnly 쿠키로 재설정
     */
    @PostMapping("/auth/refresh")
    public ResponseEntity<ApiResponse<UserAuthResponse>> refresh(
            @RequestBody(required = false) java.util.Map<String, String> body,
            @CookieValue(name = CookieUtil.REFRESH_TOKEN_COOKIE, required = false) String refreshTokenFromCookie,
            HttpServletResponse response) {
        log.debug("Refresh token request");

        // 쿠키 우선, 없으면 바디 fallback (마이그레이션 기간 호환성)
        String refreshToken = (refreshTokenFromCookie != null)
                ? refreshTokenFromCookie
                : (body != null ? body.get("refreshToken") : null);

        UserAuthResponse auth = userCommandService.refreshToken(refreshToken);

        // Refresh Token Rotation: 새 accessToken + 새 refreshToken 모두 쿠키 갱신
        cookieUtil.addAccessTokenCookie(response, auth.getAccessToken());
        cookieUtil.addRefreshTokenCookie(response, auth.getRefreshToken());

        return ResponseEntity.ok(ApiResponse.ok(auth.withoutTokens()));
    }

    /**
     * 로그아웃
     * - DB RefreshToken 삭제
     * - 쿠키 만료 처리
     */
    @PostMapping("/auth/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            Authentication authentication,
            HttpServletResponse response) {
        if (authentication != null && authentication.isAuthenticated()) {
            log.debug("Logout request received");
            userCommandService.logout(authentication.getName());
        }
        cookieUtil.clearAuthCookies(response);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @GetMapping("/auth/me")
    public ResponseEntity<ApiResponse<UserDetailResponse>> getMe(Authentication authentication) {
        // 비로그인 상태: authentication이 null이거나 인증되지 않은 경우 → null 반환 (401 방지)
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.ok(ApiResponse.ok(null));
        }
        return ResponseEntity.ok(ApiResponse.ok(
                UserDetailResponse.from(userQueryService.findByEmailWithSocialAccounts(authentication.getName()))));
    }

    // ===== 관리자 사용자 관리 API =====

    @GetMapping("/admin/users/pending")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getPendingUsers(Pageable pageable) {
        log.info("Getting pending users");
        return ResponseEntity.ok(ApiResponse.ok(
                PageResponse.from(userQueryService.getPendingUsers(pageable))));
    }

    @GetMapping("/admin/users")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getAllUsers(Pageable pageable) {
        log.info("Getting all users");
        return ResponseEntity.ok(ApiResponse.ok(
                PageResponse.from(userQueryService.getAllUsers(pageable))));
    }

    @GetMapping("/admin/users/{id}")
    public ResponseEntity<ApiResponse<UserDetailResponse>> getUserDetail(@PathVariable UUID id) {
        log.info("Getting user detail: {}", id);
        return ResponseEntity.ok(ApiResponse.ok(userQueryService.getUserDetail(id)));
    }

    @GetMapping("/admin/users/pending/count")
    public ResponseEntity<ApiResponse<Long>> getPendingCount() {
        return ResponseEntity.ok(ApiResponse.ok(userQueryService.countPendingUsers()));
    }

    /** 본인 영역 권한 목록 조회 */
    @GetMapping("/me/permissions")
    public ResponseEntity<ApiResponse<java.util.List<String>>> getMyPermissions(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(
                userPermissionService.getMyPermissions(authentication.getName())));
    }
}
