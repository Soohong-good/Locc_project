package com.example.locc.domain.choir.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.common.PageResponse;
import com.example.locc.domain.choir.dto.response.ChoirVideoResponse;
import com.example.locc.domain.choir.service.ChoirQueryService;
import com.example.locc.domain.choir.service.ChoirSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 찬양대 YouTube 영상 API Controller
 * - 공개 API: 목록 조회
 * - 관리자 API: 수동 동기화 (/api/admin/** 경로로 SecurityConfig에서 이미 ADMIN 권한 보호됨)
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class ChoirApiController {

    private final ChoirQueryService choirQueryService;
    private final ChoirSyncService choirSyncService;

    @GetMapping("/api/choir")
    public ResponseEntity<ApiResponse<PageResponse<ChoirVideoResponse>>> list(
            @PageableDefault(size = 12, sort = "publishedAt", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) String choirName) {
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(choirQueryService.findList(pageable, choirName))));
    }

    @PostMapping("/api/admin/choir/sync")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> sync() {
        int created = choirSyncService.syncFromPlaylist();
        log.info("[찬양대 동기화] 관리자 수동 트리거: 신규 {}개", created);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("created", created)));
    }
}
