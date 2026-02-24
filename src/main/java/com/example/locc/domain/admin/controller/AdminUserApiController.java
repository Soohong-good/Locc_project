package com.example.locc.domain.admin.controller;

import com.example.locc.domain.user.service.UserCommandService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
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

    /**
     * 회원 승인
     */
    @PostMapping("/{userId}/approve")
    public ResponseEntity<Void> approve(@PathVariable UUID userId) {
        log.warn(">>> [API 호출] 회원 승인 요청: userId={}", userId);
        userCommandService.approve(userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 회원 반려
     */
    @PostMapping("/{userId}/reject")
    public ResponseEntity<Void> reject(
            @PathVariable UUID userId,
            @RequestBody Map<String, String> request) {
        String reason = request.get("reason");
        log.warn(">>> [API 호출] 회원 반려 요청: userId={}, reason={}", userId, reason);
        userCommandService.reject(userId, reason);
        return ResponseEntity.ok().build();
    }

    /**
     * 회원 차단 (비활성화)
     */
    @PostMapping("/{userId}/disable")
    public ResponseEntity<Void> disable(@PathVariable UUID userId) {
        log.warn(">>> [API 호출] 회원 차단 요청: userId={}", userId);
        userCommandService.disable(userId);
        log.warn(">>> [API 완료] 회원 차단 완료: userId={}", userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 회원 차단 해제 (활성화)
     */
    @PostMapping("/{userId}/enable")
    public ResponseEntity<Void> enable(@PathVariable UUID userId) {
        log.warn(">>> [API 호출] 회원 차단 해제 요청: userId={}", userId);
        userCommandService.enable(userId);
        log.warn(">>> [API 완료] 회원 차단 해제 완료: userId={}", userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 회원 삭제 (논리적 삭제)
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> delete(@PathVariable UUID userId) {
        log.warn(">>> [API 호출] 회원 삭제 요청: userId={}", userId);
        userCommandService.delete(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 회원 복구
     */
    @PostMapping("/{userId}/restore")
    public ResponseEntity<Void> restore(@PathVariable UUID userId) {
        log.warn(">>> [API 호출] 회원 복구 요청: userId={}", userId);
        userCommandService.restore(userId);
        return ResponseEntity.ok().build();
    }
}
