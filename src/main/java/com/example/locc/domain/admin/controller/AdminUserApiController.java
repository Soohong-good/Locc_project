package com.example.locc.domain.admin.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.domain.user.dto.request.UserRejectRequest;
import com.example.locc.domain.user.entity.AreaType;
import com.example.locc.domain.user.service.UserCommandService;
import com.example.locc.domain.user.service.UserPermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * 관리자 전용 회원 관리 API Controller
 * - 행동(action)만 담당: 승인, 반려, 차단, 삭제 등
 * - ADMIN 권한 필수
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUserApiController {

    private final UserCommandService userCommandService;
    private final UserPermissionService userPermissionService;

    @PostMapping("/{userId}/approve")
    public ResponseEntity<ApiResponse<Void>> approve(@PathVariable UUID userId) {
        log.warn(">>> [API 호출] 회원 승인 요청: userId={}", userId);
        userCommandService.approve(userId);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/{userId}/reject")
    public ResponseEntity<ApiResponse<Void>> reject(
            @PathVariable UUID userId,
            @Valid @RequestBody UserRejectRequest request) {
        log.warn(">>> [API 호출] 회원 반려 요청: userId={}", userId);
        userCommandService.reject(userId, request.getReason());
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/{userId}/disable")
    public ResponseEntity<ApiResponse<Void>> disable(@PathVariable UUID userId) {
        log.warn(">>> [API 호출] 회원 차단 요청: userId={}", userId);
        userCommandService.disable(userId);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/{userId}/enable")
    public ResponseEntity<ApiResponse<Void>> enable(@PathVariable UUID userId) {
        log.warn(">>> [API 호출] 회원 차단 해제 요청: userId={}", userId);
        userCommandService.enable(userId);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID userId) {
        log.warn(">>> [API 호출] 회원 삭제 요청: userId={}", userId);
        userCommandService.delete(userId);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/{userId}/restore")
    public ResponseEntity<ApiResponse<Void>> restore(@PathVariable UUID userId) {
        log.warn(">>> [API 호출] 회원 복구 요청: userId={}", userId);
        userCommandService.restore(userId);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/{userId}/grant-operator")
    public ResponseEntity<ApiResponse<Void>> grantOperator(@PathVariable UUID userId) {
        log.warn(">>> [API 호출] 운영자 권한 부여: userId={}", userId);
        userCommandService.grantOperator(userId);
        return ResponseEntity.ok(ApiResponse.ok(null, "운영자 권한이 부여되었습니다."));
    }

    @PostMapping("/{userId}/revoke-operator")
    public ResponseEntity<ApiResponse<Void>> revokeOperator(@PathVariable UUID userId) {
        log.warn(">>> [API 호출] 운영자 권한 회수: userId={}", userId);
        userCommandService.revokeOperator(userId);
        return ResponseEntity.ok(ApiResponse.ok(null, "운영자 권한이 회수되었습니다."));
    }

    // ── 영역별 작성 권한 관리 ─────────────────────────────────────────────

    @GetMapping("/{userId}/permissions")
    public ResponseEntity<ApiResponse<List<String>>> getUserPermissions(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.ok(userPermissionService.getUserPermissions(userId)));
    }

    @PostMapping("/{userId}/permissions/{area}")
    public ResponseEntity<ApiResponse<Void>> grantPermission(
            @PathVariable UUID userId,
            @PathVariable String area,
            Authentication authentication) {
        String adminEmail = authentication.getName();
        userPermissionService.grantPermission(userId, AreaType.valueOf(area.toUpperCase()), adminEmail);
        return ResponseEntity.ok(ApiResponse.ok(null, "권한이 부여되었습니다."));
    }

    @DeleteMapping("/{userId}/permissions/{area}")
    public ResponseEntity<ApiResponse<Void>> revokePermission(
            @PathVariable UUID userId,
            @PathVariable String area) {
        userPermissionService.revokePermission(userId, AreaType.valueOf(area.toUpperCase()));
        return ResponseEntity.ok(ApiResponse.ok(null, "권한이 회수되었습니다."));
    }
}
