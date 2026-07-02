package com.example.locc.domain.admin.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.domain.admin.dto.request.AdminChannelIdUpdateRequest;
import com.example.locc.domain.admin.dto.request.AdminPlaylistIdUpdateRequest;
import com.example.locc.domain.admin.dto.response.SermonPlaylistStatus;
import com.example.locc.domain.admin.dto.response.WorshipYouTubeStatus;
import com.example.locc.domain.admin.service.AdminYouTubeQueryService;
import com.example.locc.domain.department.dto.response.DepartmentResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 관리자 YouTube 현황 조회 API
 * - 부서 목록 (채널 ID + 최신 영상 현황)
 * - 예배 영상 현황 (송구영신예배, 성경학교)
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/youtube")
@RequiredArgsConstructor
public class AdminYouTubeApiController {

    private final AdminYouTubeQueryService adminYouTubeQueryService;

    /**
     * 부서 전체 목록 (YouTube 현황 포함)
     */
    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> getDepartments() {
        return ResponseEntity.ok(ApiResponse.ok(adminYouTubeQueryService.getDepartments()));
    }

    /**
     * 예배 YouTube 현황 조회 (송구영신예배 + 성경학교)
     */
    @GetMapping("/worship")
    public ResponseEntity<ApiResponse<WorshipYouTubeStatus>> getWorshipStatus() {
        return ResponseEntity.ok(ApiResponse.ok(adminYouTubeQueryService.getWorshipStatus()));
    }

    /**
     * 예배 재생목록 현황 조회 (주일/수요·금요예배)
     * - 재생목록 ID + 라벨만 반환 (YouTube API 호출 없음)
     */
    @GetMapping("/sermon-playlists")
    public ResponseEntity<ApiResponse<List<SermonPlaylistStatus>>> getSermonPlaylistStatus() {
        return ResponseEntity.ok(ApiResponse.ok(adminYouTubeQueryService.getSermonPlaylistStatuses()));
    }

    /**
     * 부서 YouTube 채널 ID 수정
     */
    @PatchMapping("/departments/{code}/channel")
    public ResponseEntity<ApiResponse<Void>> updateDepartmentChannelId(
            @PathVariable String code,
            @Valid @RequestBody AdminChannelIdUpdateRequest request) {

        log.info("부서 채널 ID 수정 요청: code={}", code);
        adminYouTubeQueryService.updateDepartmentChannelId(code, request.getChannelId());
        return ResponseEntity.ok(ApiResponse.ok());
    }

    /**
     * 예배 재생목록 ID 수정 (application.yml 값 DB override)
     */
    @PatchMapping("/sermon-playlists/{playlistKey}/playlist-id")
    public ResponseEntity<ApiResponse<Void>> updateSermonPlaylistId(
            @PathVariable String playlistKey,
            @Valid @RequestBody AdminPlaylistIdUpdateRequest request) {

        log.info("예배 재생목록 ID 수정 요청: key={}", playlistKey);
        adminYouTubeQueryService.updateSermonPlaylistId(playlistKey, request.getPlaylistId());
        return ResponseEntity.ok(ApiResponse.ok());
    }

    /**
     * 특정 예배 재생목록 최신 영상 수동 갱신
     */
    @PostMapping("/sermon-playlists/{playlistKey}/refresh")
    public ResponseEntity<ApiResponse<SermonPlaylistStatus>> refreshSermonPlaylist(
            @PathVariable String playlistKey) {

        log.info("예배 재생목록 수동 갱신 요청: key={}", playlistKey);
        SermonPlaylistStatus result = adminYouTubeQueryService.refreshSermonPlaylist(playlistKey);
        log.info("갱신 완료: key={}, videoId={}", playlistKey, result.latestVideoId());
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
