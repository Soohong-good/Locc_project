package com.example.locc.domain.helprequest.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.common.PageResponse;
import com.example.locc.domain.helprequest.dto.command.UpdateAdminMemoCommand;
import com.example.locc.domain.helprequest.dto.command.UpdateHelpRequestStatusCommand;
import com.example.locc.domain.helprequest.dto.response.HelpRequestResponse;
import com.example.locc.domain.helprequest.entity.HelpRequestStatus;
import com.example.locc.domain.helprequest.service.HelpRequestCommandService;
import com.example.locc.domain.helprequest.service.HelpRequestQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<HelpRequestResponse>>> getHelpRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) HelpRequestStatus status) {

        return ResponseEntity.ok(ApiResponse.ok(
                PageResponse.from(helpRequestQueryService.getList(status, page, size))));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<HelpRequestResponse>> updateStatus(
            @PathVariable Long id, @RequestBody UpdateHelpRequestStatusCommand command) {
        log.info("[도움요청 상태 변경] ID: {}, 상태: {}", id, command.getStatus());
        return ResponseEntity.ok(ApiResponse.ok(helpRequestCommandService.updateStatus(id, command)));
    }

    @PatchMapping("/{id}/memo")
    public ResponseEntity<ApiResponse<HelpRequestResponse>> updateAdminMemo(
            @PathVariable Long id, @RequestBody UpdateAdminMemoCommand command) {
        log.info("[도움요청 메모 수정] ID: {}", id);
        return ResponseEntity.ok(ApiResponse.ok(helpRequestCommandService.updateAdminMemo(id, command)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        log.info("[도움요청 삭제] ID: {}", id);
        helpRequestCommandService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
