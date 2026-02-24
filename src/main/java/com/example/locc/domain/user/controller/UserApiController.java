package com.example.locc.domain.user.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.common.PageResponse;
import com.example.locc.domain.user.dto.request.UserLoginRequest;
import com.example.locc.domain.user.dto.request.UserRegisterRequest;
import com.example.locc.domain.user.dto.response.UserAuthResponse;
import com.example.locc.domain.user.dto.response.UserDetailResponse;
import com.example.locc.domain.user.dto.response.UserResponse;
import com.example.locc.domain.user.service.UserCommandService;
import com.example.locc.domain.user.service.UserQueryService;
import com.example.locc.domain.user.repository.UserRepository;
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
 */
@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserApiController {

    private final UserCommandService userCommandService;
    private final UserQueryService userQueryService;
    private final UserRepository userRepository;

    // ===== 인증 관련 API (AuthController 통합) =====

    @PostMapping("/auth/register")
    public ResponseEntity<ApiResponse<UserAuthResponse>> register(@Valid @RequestBody UserRegisterRequest request) {
        log.info("Register request for email: {}", request.getEmail());
        return ResponseEntity.ok(ApiResponse.ok(userCommandService.register(request.toCommand())));
    }

    @PostMapping("/users/register")
    public ResponseEntity<ApiResponse<UserAuthResponse>> registerAlternative(@Valid @RequestBody UserRegisterRequest request) {
        log.info("Register request (alternative path) for email: {}", request.getEmail());
        return ResponseEntity.ok(ApiResponse.ok(userCommandService.register(request.toCommand())));
    }

    @GetMapping("/auth/check-email")
    public ResponseEntity<ApiResponse<Boolean>> checkEmail(@RequestParam String email) {
        log.info("Check email availability: {}", email);
        boolean isAvailable = !userRepository.existsByEmail(email);
        return ResponseEntity.ok(ApiResponse.ok(isAvailable));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<ApiResponse<UserAuthResponse>> login(@Valid @RequestBody UserLoginRequest request) {
        log.info("Login request for email: {}", request.getEmail());
        return ResponseEntity.ok(ApiResponse.ok(userCommandService.login(request.toCommand())));
    }

    @PostMapping("/auth/refresh")
    public ResponseEntity<ApiResponse<UserAuthResponse>> refresh(@RequestBody java.util.Map<String, String> request) {
        log.info("Refresh token request");
        return ResponseEntity.ok(ApiResponse.ok(userCommandService.refreshToken(request.get("refreshToken"))));
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<ApiResponse<Void>> logout(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            log.info("Logout request for email: {}", authentication.getName());
            userCommandService.logout(authentication.getName());
        }
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @GetMapping("/auth/me")
    public ResponseEntity<ApiResponse<UserDetailResponse>> getMe(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(ApiResponse.ok(UserDetailResponse.from(userQueryService.findByEmail(authentication.getName()))));
    }

    @GetMapping("/admin/users/pending")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getPendingUsers(Pageable pageable) {
        log.info("Getting pending users");
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(userQueryService.getPendingUsers(pageable))));
    }

    @GetMapping("/admin/users")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getAllUsers(Pageable pageable) {
        log.info("Getting all users");
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(userQueryService.getAllUsers(pageable))));
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
}
