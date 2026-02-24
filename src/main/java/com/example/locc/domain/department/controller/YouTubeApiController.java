package com.example.locc.domain.department.controller;

import com.example.locc.domain.department.dto.response.YouTubeVideoResponse;
import com.example.locc.domain.department.service.YouTubeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * YouTube 최신 영상 조회 API
 * 클라이언트에서 JavaScript로 호출하여 최신 영상 정보를 가져옵니다
 */
@Slf4j
@RestController
@RequestMapping("/api/youtube")
@RequiredArgsConstructor
public class YouTubeApiController {

    private final YouTubeService youTubeService;

    /**
     * 채널의 최신 영상 정보 조회
     * 
     * @param channelId 유튜브 채널 ID
     * @return 최신 영상 정보 (videoId, title)
     */
    @GetMapping("/latest-video/{channelId}")
    public ResponseEntity<YouTubeVideoResponse> getLatestVideo(@PathVariable String channelId) {
        log.debug("Fetching latest video for channel: {}", channelId);
        
        String[] videoInfo = youTubeService.getLatestVideo(channelId);
        
        if (videoInfo != null && videoInfo.length == 2) {
            YouTubeVideoResponse response = YouTubeVideoResponse.of(
                videoInfo[0], // videoId
                videoInfo[1], // title
                channelId
            );
            return ResponseEntity.ok(response);
        }
        
        log.warn("No video found for channel: {}", channelId);
        return ResponseEntity.notFound().build();
    }

    /**
     * 디버그: 채널의 최근 영상 목록 조회 (라이브 여부 포함)
     * 
     * @param channelId 유튜브 채널 ID
     * @return 최근 영상 목록 (디버그용)
     */
    @GetMapping("/debug/playlist/{channelId}")
    public ResponseEntity<?> debugPlaylist(@PathVariable String channelId) {
        log.info("DEBUG: Fetching playlist for channel: {}", channelId);
        
        try {
            String uploadsPlaylistId = channelId.replaceFirst("^UC", "UU");
            String[] videoInfo = youTubeService.getLatestVideo(channelId);
            
            return ResponseEntity.ok(java.util.Map.of(
                "channelId", channelId,
                "uploadsPlaylistId", uploadsPlaylistId,
                "latestVideo", videoInfo != null ? java.util.Map.of(
                    "videoId", videoInfo[0],
                    "title", videoInfo[1]
                ) : "No video found",
                "message", "Check application logs for detailed filtering info"
            ));
        } catch (Exception e) {
            log.error("DEBUG error", e);
            return ResponseEntity.internalServerError().body(java.util.Map.of(
                "error", e.getMessage(),
                "trace", e.toString()
            ));
        }
    }
    
    /**
     * 테스트: 초등부 영상 강제 업데이트
     */
    @GetMapping("/test/update-children")
    public ResponseEntity<?> testUpdateChildren() {
        log.info("TEST: Force updating children department video");
        
        String channelId = "UCYya7omauT_BooYya2_Cp-A";  // 올바른 초등부 채널 ID
        String[] videoInfo = youTubeService.getLatestVideo(channelId);
        
        if (videoInfo != null) {
            return ResponseEntity.ok(java.util.Map.of(
                "status", "success",
                "videoId", videoInfo[0],
                "title", videoInfo[1],
                "message", "Check logs for details"
            ));
        } else {
            return ResponseEntity.ok(java.util.Map.of(
                "status", "no video found",
                "message", "Check logs for filtering details"
            ));
        }
    }
}
