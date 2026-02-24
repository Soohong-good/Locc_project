package com.example.locc.domain.newyear.controller;

import com.example.locc.domain.newyear.service.NewYearService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * NewYear ApiController
 * - 관리자 전용: YouTube 영상 업데이트
 */
@Slf4j
@RestController
@RequestMapping("/api/newyear")
@RequiredArgsConstructor
public class NewYearApiController {

    private final NewYearService newYearService;

    /**
     * YouTube 최신 영상 업데이트 (관리자 전용)
     */
    @PostMapping("/update-video")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateVideo() {
        try {
            newYearService.updateLatestVideo();
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "송구영신예배 최신 영상이 업데이트되었습니다."
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("송구영신예배 영상 업데이트 실패", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", "error",
                    "message", "영상 업데이트에 실패했습니다."
            ));
        }
    }

    /**
     * YouTube 재생목록 ID 설정 (관리자 전용)
     */
    @PutMapping("/playlist")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updatePlaylist(
            @RequestBody Map<String, String> request) {
        try {
            String playlistId = request.get("playlistId");
            if (playlistId == null || playlistId.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "status", "error",
                        "message", "재생목록 ID를 입력해주세요."
                ));
            }
            
            newYearService.updateYoutubePlaylist(playlistId);
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "YouTube 재생목록 ID가 설정되었습니다."
            ));
        } catch (Exception e) {
            log.error("송구영신예배 재생목록 ID 설정 실패", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", "error",
                    "message", "재생목록 ID 설정에 실패했습니다."
            ));
        }
    }

    /**
     * 녹취본 업데이트 (관리자 전용)
     */
    @PutMapping("/transcript")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateTranscript(
            @RequestBody Map<String, String> request) {
        try {
            String transcript = request.get("transcript");
            
            newYearService.updateTranscript(transcript);
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "녹취본이 저장되었습니다."
            ));
        } catch (Exception e) {
            log.error("송구영신예배 녹취본 저장 실패", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", "error",
                    "message", "녹취본 저장에 실패했습니다."
            ));
        }
    }
}
