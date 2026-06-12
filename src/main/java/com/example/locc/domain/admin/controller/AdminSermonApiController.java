package com.example.locc.domain.admin.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.common.PageResponse;
import com.example.locc.domain.sermon.dto.response.SermonResponse;
import com.example.locc.domain.sermon.service.SermonCommandService;
import com.example.locc.domain.sermon.service.SermonQueryService;
import com.example.locc.domain.sermon.service.SermonYouTubeSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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
    private final SermonYouTubeSyncService sermonYouTubeSyncService;

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

    // ── YouTube 자동 동기화 수동 트리거 ─────────────────────────────

    /**
     * 전체 재생목록 수동 동기화
     * 응답: { "sunday-morning-1": 1, "sunday-morning-2": 0, ... }
     */
    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> syncAll() {
        log.info("관리자 YouTube 전체 동기화 수동 트리거");
        Map<String, Integer> result = sermonYouTubeSyncService.syncAll();
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /**
     * 특정 재생목록 수동 동기화
     * playlistKey: sunday-morning-1 | sunday-morning-2 | sunday-afternoon | wednesday | friday
     */
    @PostMapping("/sync/{playlistKey}")
    public ResponseEntity<ApiResponse<Integer>> syncByKey(@PathVariable String playlistKey) {
        log.info("관리자 YouTube 동기화 수동 트리거: key={}", playlistKey);
        int created = sermonYouTubeSyncService.syncByKey(playlistKey);
        return ResponseEntity.ok(ApiResponse.ok(created));
    }
}
