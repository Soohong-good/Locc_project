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
}
