package com.example.locc.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * YouTube Data API 관련 설정
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "youtube")
public class YouTubeProperties {
    
    /**
     * YouTube Data API 키
     */
    private String apiKey;

    /**
     * YouTube 재생목록 ID 맵
     * - sunday-morning-1: 주일오전 1부
     * - sunday-morning-2: 주일오전 2부
     * - sunday-afternoon: 주일오후
     * - wednesday: 수요예배
     * - friday: 금요기도회
     */
    private Map<String, String> playlists;

    /**
     * 재생목록 ID 조회
     */
    public String getPlaylistId(String key) {
        return playlists != null ? playlists.get(key) : null;
    }
}
