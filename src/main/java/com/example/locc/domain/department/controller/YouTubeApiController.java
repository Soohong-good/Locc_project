package com.example.locc.domain.department.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.domain.department.dto.response.YouTubeVideoResponse;
import com.example.locc.domain.department.service.YouTubeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        return ResponseEntity.ok(ApiResponse.ok(youTubeService.getLatestVideoResponse(channelId)));
    }
}
