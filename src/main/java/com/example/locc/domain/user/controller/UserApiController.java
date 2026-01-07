package com.example.locc.domain.user.controller;

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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
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

    /**
     * 회원가입
     */
    @PostMapping("/auth/register")
    public ResponseEntity<UserAuthResponse> register(@Valid @RequestBody UserRegisterRequest request) {
        log.info("Register request for email: {}", request.getEmail());
        UserAuthResponse response = userCommandService.register(request.toCommand());
        return ResponseEntity.ok(response);
    }

    /**
     * 이메일 중복 체크
     */
    @GetMapping("/auth/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        log.info("Check email availability: {}", email);
        boolean isAvailable = !userRepository.existsByEmail(email);
        return ResponseEntity.ok(Map.of("available", isAvailable));
    }

    /**
     * 로그인
     */
    @PostMapping("/auth/login")
    public ResponseEntity<UserAuthResponse> login(@Valid @RequestBody UserLoginRequest request) {
        log.info("Login request for email: {}", request.getEmail());
        UserAuthResponse response = userCommandService.login(request.toCommand());
        return ResponseEntity.ok(response);
    }

    /**
     * 토큰 갱신
     */
    @PostMapping("/auth/refresh")
    public ResponseEntity<UserAuthResponse> refresh(@RequestBody Map<String, String> request) {
        log.info("Refresh token request");
        String refreshToken = request.get("refreshToken");
        UserAuthResponse response = userCommandService.refreshToken(refreshToken);
        return ResponseEntity.ok(response);
    }

    /**
     * 로그아웃
     */
    @PostMapping("/auth/logout")
    public ResponseEntity<Void> logout(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName();
            log.info("Logout request for email: {}", email);
            userCommandService.logout(email);
        }
        return ResponseEntity.ok().build();
    }

    /**
     * 현재 로그인한 사용자 정보
     */
    @GetMapping("/auth/me")
    public ResponseEntity<UserDetailResponse> getMe(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = authentication.getName();
        var user = userQueryService.findByEmail(email);
        return ResponseEntity.ok(UserDetailResponse.from(user));
    }

    // ===== 사용자 관리 API =====

    /**
     * 승인 대기 중인 회원 목록 조회
     */
    @GetMapping("/admin/users/pending")
    public ResponseEntity<Page<UserResponse>> getPendingUsers(Pageable pageable) {
        log.info("Getting pending users");
        Page<UserResponse> users = userQueryService.getPendingUsers(pageable);
        return ResponseEntity.ok(users);
    }

    /**
     * 전체 회원 목록 조회
     */
    @GetMapping("/admin/users")
    public ResponseEntity<Page<UserResponse>> getAllUsers(Pageable pageable) {
        log.info("Getting all users");
        Page<UserResponse> users = userQueryService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    /**
     * 회원 상세 조회
     */
    @GetMapping("/admin/users/{id}")
    public ResponseEntity<UserDetailResponse> getUserDetail(@PathVariable UUID id) {
        log.info("Getting user detail: {}", id);
        UserDetailResponse user = userQueryService.getUserDetail(id);
        return ResponseEntity.ok(user);
    }

    /**
     * 회원 승인
     */
    @PostMapping("/admin/users/{id}/approve")
    public ResponseEntity<Void> approveUser(@PathVariable UUID id) {
        log.info("Approving user: {}", id);
        userCommandService.approve(id);
        return ResponseEntity.ok().build();
    }

    /**
     * 회원 반려
     */
    @PostMapping("/admin/users/{id}/reject")
    public ResponseEntity<Void> rejectUser(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        String reason = request.get("reason");
        log.info("Rejecting user: {} - Reason: {}", id, reason);
        userCommandService.reject(id, reason);
        return ResponseEntity.ok().build();
    }

    /**
     * 회원 삭제 (논리적 삭제)
     */
    @DeleteMapping("/admin/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        log.info("Deleting user: {}", id);
        userCommandService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 회원 복구
     */
    @PostMapping("/admin/users/{id}/restore")
    public ResponseEntity<Void> restoreUser(@PathVariable UUID id) {
        log.info("Restoring user: {}", id);
        userCommandService.restore(id);
        return ResponseEntity.ok().build();
    }

    /**
     * 승인 대기 회원 수 조회
     */
    @GetMapping("/admin/users/pending/count")
    public ResponseEntity<Map<String, Long>> getPendingCount() {
        Long count = userQueryService.countPendingUsers();
        return ResponseEntity.ok(Map.of("count", count));
    }
}
