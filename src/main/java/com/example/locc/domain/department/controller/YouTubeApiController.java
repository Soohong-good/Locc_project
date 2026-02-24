package com.example.locc.domain.department.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.domain.department.dto.response.YouTubeVideoResponse;
import com.example.locc.domain.department.service.YouTubeService;
import com.example.locc.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * YouTube 최신 영상 조회 API
 */
@Slf4j
@RestController
@RequestMapping("/api/youtube")
@RequiredArgsConstructor
public class YouTubeApiController {

    private final YouTubeService youTubeService;

    /**
     * 채널의 최신 영상 정보 조회
     */
    @GetMapping("/latest-video/{channelId}")
    public ResponseEntity<ApiResponse<YouTubeVideoResponse>> getLatestVideo(@PathVariable String channelId) {
        log.debug("Fetching latest video for channel: {}", channelId);
        String[] videoInfo = youTubeService.getLatestVideo(channelId);
        if (videoInfo == null || videoInfo.length < 2) {
            throw new NotFoundException("채널의 최신 영상을 찾을 수 없습니다.");
        }
        return ResponseEntity.ok(ApiResponse.ok(YouTubeVideoResponse.of(videoInfo[0], videoInfo[1], channelId)));
    }

    /**
     * 디버그: 채널 최근 영상 목록 조회 (내부용)
     */
    @GetMapping("/debug/playlist/{channelId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> debugPlaylist(@PathVariable String channelId) {
        log.info("DEBUG: Fetching playlist for channel: {}", channelId);
        String uploadsPlaylistId = channelId.replaceFirst("^UC", "UU");
        String[] videoInfo = youTubeService.getLatestVideo(channelId);
        Map<String, Object> data = Map.of(
                "channelId", channelId,
                "uploadsPlaylistId", uploadsPlaylistId,
                "latestVideo", videoInfo != null
                        ? Map.of("videoId", videoInfo[0], "title", videoInfo[1])
                        : "No video found",
                "message", "Check application logs for detailed filtering info"
        );
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    /**
     * 테스트: 초등부 영상 강제 업데이트 (내부용)
     */
    @GetMapping("/test/update-children")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testUpdateChildren() {
        log.info("TEST: Force updating children department video");
        String channelId = "UCYya7omauT_BooYya2_Cp-A";
        String[] videoInfo = youTubeService.getLatestVideo(channelId);
        if (videoInfo != null) {
            return ResponseEntity.ok(ApiResponse.ok(Map.of(
                    "videoId", videoInfo[0],
                    "title", videoInfo[1]
            ), "업데이트 성공"));
        }
        return ResponseEntity.ok(ApiResponse.ok(null, "영상을 찾을 수 없습니다."));
    }
}
