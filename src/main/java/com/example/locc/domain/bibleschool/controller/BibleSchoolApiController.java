package com.example.locc.domain.bibleschool.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.domain.bibleschool.dto.request.BibleSchoolPlaylistUpdateRequest;
import com.example.locc.domain.bibleschool.service.BibleSchoolCommandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * BibleSchool ApiController
 * - 관리자 전용: YouTube 영상 업데이트
 * IllegalStateException → RestExceptionHandler(400) 처리
 */
@Slf4j
@RestController
@RequestMapping("/api/bibleschool")
@RequiredArgsConstructor
public class BibleSchoolApiController {

    private final BibleSchoolCommandService bibleSchoolCommandService;

    @PostMapping("/update-video")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateVideo() {
        bibleSchoolCommandService.updateLatestVideo();
        return ResponseEntity.ok(ApiResponse.ok(null, "성경학교 최신 영상이 업데이트되었습니다."));
    }

    @PutMapping("/playlist")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updatePlaylist(@Valid @RequestBody BibleSchoolPlaylistUpdateRequest request) {
        bibleSchoolCommandService.updateYoutubePlaylist(request.getPlaylistId());
        return ResponseEntity.ok(ApiResponse.ok(null, "YouTube 재생목록 ID가 설정되었습니다."));
    }
}
