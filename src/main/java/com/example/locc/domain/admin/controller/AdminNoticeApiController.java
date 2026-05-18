package com.example.locc.domain.admin.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.domain.notice.dto.request.NoticeSearchCondition;
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

    @GetMapping
    public ResponseEntity<ApiResponse<List<NoticeResponse>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.debug("관리자 공지사항 목록 조회: page={}, size={}", page, size);

        NoticeSearchCondition condition = NoticeSearchCondition.builder()
                .page(page).size(size).build();

        return ResponseEntity.ok(ApiResponse.ok(noticeQueryService.findAllForAdmin(condition).getContent()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id, Authentication authentication) {
        log.info("관리자 공지사항 삭제 요청: id={}", id);
        noticeCommandService.delete(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PatchMapping("/{id}/pin")
    public ResponseEntity<ApiResponse<Void>> togglePin(@PathVariable Long id, Authentication authentication) {
        log.info("관리자 공지사항 고정 토글: id={}", id);
        noticeCommandService.togglePin(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
