package com.example.locc.domain.department.service;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.youtube.YouTube;
import com.google.api.services.youtube.model.SearchListResponse;
import com.google.api.services.youtube.model.SearchResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

@Slf4j
@Service
public class YouTubeService {

    @Value("${youtube.api-key}")
    private String apiKey;

    private static final String APPLICATION_NAME = "LOCC Church";

    /**
     * 채널의 최신 영상 정보 조회
     * @param channelId 유튜브 채널 ID
     * @return 영상 ID, 제목을 담은 배열 [videoId, title]
     */
    public String[] getLatestVideo(String channelId) {
        try {
            YouTube youtube = new YouTube.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JacksonFactory.getDefaultInstance(),
                null
            )
            .setApplicationName(APPLICATION_NAME)
            .build();

            YouTube.Search.List request = youtube.search()
                .list(List.of("snippet"))
                .setKey(apiKey)
                .setChannelId(channelId)
                .setOrder("date")
                .setType(List.of("video"))
                .setMaxResults(1L);

            SearchListResponse response = request.execute();
            List<SearchResult> searchResults = response.getItems();

            if (searchResults != null && !searchResults.isEmpty()) {
                SearchResult video = searchResults.get(0);
                String videoId = video.getId().getVideoId();
                String title = video.getSnippet().getTitle();
                
                log.info("Latest video found - Channel: {}, Video ID: {}, Title: {}", 
                    channelId, videoId, title);
                
                return new String[]{videoId, title};
            }
            
            log.warn("No videos found for channel: {}", channelId);
            return null;

        } catch (GeneralSecurityException | IOException e) {
            log.error("Error fetching YouTube video for channel: {}", channelId, e);
            return null;
        }
    }

    /**
     * 커스텀 URL로 채널 ID 조회
     * @param customUrl 커스텀 URL (예: @mgua1234)
     * @return 채널 ID
     */
    public String getChannelIdByCustomUrl(String customUrl) {
        try {
            YouTube youtube = new YouTube.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JacksonFactory.getDefaultInstance(),
                null
            )
            .setApplicationName(APPLICATION_NAME)
            .build();

            // @ 제거
            String username = customUrl.startsWith("@") ? customUrl.substring(1) : customUrl;

            YouTube.Search.List request = youtube.search()
                .list(List.of("snippet"))
                .setKey(apiKey)
                .setQ(username)
                .setType(List.of("channel"))
                .setMaxResults(1L);

            SearchListResponse response = request.execute();
            List<SearchResult> searchResults = response.getItems();

            if (searchResults != null && !searchResults.isEmpty()) {
                String channelId = searchResults.get(0).getSnippet().getChannelId();
                log.info("Channel ID found - Custom URL: {}, Channel ID: {}", customUrl, channelId);
                return channelId;
            }

            log.warn("Channel not found for custom URL: {}", customUrl);
            return null;

        } catch (GeneralSecurityException | IOException e) {
            log.error("Error fetching channel ID for custom URL: {}", customUrl, e);
            return null;
        }
    }
}
