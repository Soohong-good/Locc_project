package com.example.locc.domain.admin.controller;

import com.example.locc.domain.notice.dto.response.NoticeResponse;
import com.example.locc.domain.notice.service.NoticeCommandService;
import com.example.locc.domain.notice.service.NoticeQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    private final NoticeQueryService noticeQueryService;

    /**
     * 공지사항 목록 조회 (비동기) - 고정/비고정 모두 포함
     */
    @GetMapping
    public ResponseEntity<List<NoticeResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.debug("관리자 공지사항 목록 조회: page={}, size={}", page, size);
        
        com.example.locc.domain.notice.dto.request.NoticeSearchCondition condition = 
                com.example.locc.domain.notice.dto.request.NoticeSearchCondition.builder()
                        .page(page)
                        .size(size)
                        .build();
        
        org.springframework.data.domain.Page<NoticeResponse> noticePage = 
                noticeQueryService.findAllForAdmin(condition);
        
        return ResponseEntity.ok(noticePage.getContent());
    }

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
