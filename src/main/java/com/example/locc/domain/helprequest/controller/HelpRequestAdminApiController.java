package com.example.locc.domain.helprequest.controller;

import com.example.locc.domain.helprequest.dto.command.UpdateAdminMemoCommand;
import com.example.locc.domain.helprequest.dto.command.UpdateHelpRequestStatusCommand;
import com.example.locc.domain.helprequest.dto.response.HelpRequestResponse;
import com.example.locc.domain.helprequest.entity.HelpRequestStatus;
import com.example.locc.domain.helprequest.service.HelpRequestCommandService;
import com.example.locc.domain.helprequest.service.HelpRequestQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 도움요청 관리자 API Controller
 * - 관리자 전용 엔드포인트
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/help-requests")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class HelpRequestAdminApiController {

    private final HelpRequestQueryService helpRequestQueryService;
    private final HelpRequestCommandService helpRequestCommandService;

    /**
     * 도움요청 목록 조회 (페이징)
     * GET /api/admin/help-requests?page=0&size=20&status=PENDING
     */
    @GetMapping
    public ResponseEntity<Page<HelpRequestResponse>> getHelpRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) HelpRequestStatus status
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        Page<HelpRequestResponse> result;
        if (status != null) {
            result = helpRequestQueryService.findByStatus(status, pageable);
            log.debug("[도움요청 목록 조회] 상태: {}, 페이지: {}, 크기: {}", status, page, size);
        } else {
            result = helpRequestQueryService.findAll(pageable);
            log.debug("[도움요청 목록 조회] 전체, 페이지: {}, 크기: {}", page, size);
        }
        
        return ResponseEntity.ok(result);
    }

    /**
     * 상태 변경
     * PATCH /api/admin/help-requests/{id}/status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<HelpRequestResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateHelpRequestStatusCommand command
    ) {
        log.info("[도움요청 상태 변경] ID: {}, 상태: {}", id, command.getStatus());
        
        HelpRequestResponse response = helpRequestCommandService.updateStatus(id, command);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 관리자 메모 작성/수정
     * PATCH /api/admin/help-requests/{id}/memo
     */
    @PatchMapping("/{id}/memo")
    public ResponseEntity<HelpRequestResponse> updateAdminMemo(
            @PathVariable Long id,
            @RequestBody UpdateAdminMemoCommand command
    ) {
        log.info("[도움요청 메모 수정] ID: {}", id);
        
        HelpRequestResponse response = helpRequestCommandService.updateAdminMemo(id, command);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 도움요청 삭제
     * DELETE /api/admin/help-requests/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("[도움요청 삭제] ID: {}", id);
        
        helpRequestCommandService.delete(id);
        
        return ResponseEntity.noContent().build();
    }
}
