package com.example.locc.domain.admin.controller;

import com.example.locc.domain.notice.service.NoticeCommandService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * 관리자 전용 공지사항 API Controller
 * - 행동(action)만 담당: DELETE, PATCH
 * - 목록 조회는 AdminViewController에서 처리
 * - 생성/수정 폼은 기존 도메인 재사용
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/notices")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminNoticeApiController {

    private final NoticeCommandService noticeCommandService;

    /**
     * 공지사항 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication) {
        
        log.info("관리자 공지사항 삭제 요청: id={}, user={}", id, authentication.getName());
        noticeCommandService.delete(id, authentication.getName());
        
        return ResponseEntity.noContent().build();
    }

    /**
     * 고정 토글
     */
    @PatchMapping("/{id}/pin")
    public ResponseEntity<Void> togglePin(
            @PathVariable Long id,
            Authentication authentication) {
        
        log.info("관리자 공지사항 고정 토글: id={}, user={}", id, authentication.getName());
        noticeCommandService.togglePin(id, authentication.getName());
        
        return ResponseEntity.noContent().build();
    }
}
