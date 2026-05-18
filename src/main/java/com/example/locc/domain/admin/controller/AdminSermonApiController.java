package com.example.locc.domain.admin.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.common.PageResponse;
import com.example.locc.domain.sermon.dto.response.SermonResponse;
import com.example.locc.domain.sermon.service.SermonCommandService;
import com.example.locc.domain.sermon.service.SermonQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * 관리자 전용 설교 API Controller
 * - 행동(action)만 담당: DELETE
 * - 목록 조회는 AdminViewController에서 처리
 * - 생성/수정 폼은 기존 도메인 재사용
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/sermons")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminSermonApiController {

    private final SermonCommandService sermonCommandService;
    private final SermonQueryService sermonQueryService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<SermonResponse>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.debug("관리자 설교 목록 조회: page={}, size={}", page, size);
        return ResponseEntity.ok(ApiResponse.ok(
                PageResponse.from(sermonQueryService.findPagedForAdmin(page, size))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id, Authentication authentication) {
        log.info("관리자 설교 삭제 요청: id={}", id);
        sermonCommandService.delete(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
