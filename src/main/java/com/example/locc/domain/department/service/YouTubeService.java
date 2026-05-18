package com.example.locc.domain.department.service;

import com.example.locc.config.YouTubeProperties;
import com.example.locc.domain.department.dto.response.YouTubeVideoResponse;
import com.example.locc.exception.NotFoundException;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.youtube.YouTube;
import com.google.api.services.youtube.model.PlaylistItem;
import com.google.api.services.youtube.model.PlaylistItemListResponse;
import com.google.api.services.youtube.model.SearchListResponse;
import com.google.api.services.youtube.model.SearchResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class YouTubeService {

    private final YouTubeProperties youTubeProperties;

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
                .setKey(youTubeProperties.getApiKey())
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
     * 채널의 최신 영상 정보 조회 — Response DTO 반환
     * - null 체크 및 DTO 조립을 Service 책임으로 처리
     * - 영상이 없으면 NotFoundException
     */
    public YouTubeVideoResponse getLatestVideoResponse(String channelId) {
        String[] videoInfo = getLatestVideo(channelId);
        if (videoInfo == null || videoInfo.length < 2) {
            throw new NotFoundException("채널의 최신 영상을 찾을 수 없습니다.");
        }
        return YouTubeVideoResponse.of(videoInfo[0], videoInfo[1], channelId);
    }

    /**
     * 재생목록의 최신 영상 정보 조회
     * @param playlistId 유튜브 재생목록 ID
     * @return 영상 ID, 제목을 담은 배열 [videoId, title]
     */
    public String[] getLatestVideoFromPlaylist(String playlistId) {
        try {
            YouTube youtube = new YouTube.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JacksonFactory.getDefaultInstance(),
                null
            )
            .setApplicationName(APPLICATION_NAME)
            .build();

            YouTube.PlaylistItems.List request = youtube.playlistItems()
                .list(List.of("snippet"))
                .setKey(youTubeProperties.getApiKey())
                .setPlaylistId(playlistId)
                .setMaxResults(1L);

            PlaylistItemListResponse response = request.execute();
            
            if (response.getItems() != null && !response.getItems().isEmpty()) {
                var item = response.getItems().get(0);
                String videoId = item.getSnippet().getResourceId().getVideoId();
                String title = item.getSnippet().getTitle();
                
                log.info("Latest video found from playlist - Playlist: {}, Video ID: {}, Title: {}", 
                    playlistId, videoId, title);
                
                return new String[]{videoId, title};
            }
            
            log.warn("No videos found in playlist: {}", playlistId);
            return null;

        } catch (GeneralSecurityException | IOException e) {
            log.error("Error fetching YouTube video from playlist: {}", playlistId, e);
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
                .setKey(youTubeProperties.getApiKey())
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

    /**
     * 재생목록에서 최신 영상 N개 조회 (캐싱 적용)
     * @param playlistId 재생목록 ID
     * @param maxResults 조회할 영상 개수
     * @return 영상 정보 리스트 (videoId, title, thumbnail, publishedAt)
     */
    @Cacheable(value = "youtubeVideos", key = "#playlistId + '_' + #maxResults", unless = "#result == null || #result.isEmpty()")
    public List<Map<String, String>> getLatestVideos(String playlistId, int maxResults) {
        log.info("YouTube API 호출: playlistId={}, maxResults={}", playlistId, maxResults);
        
        try {
            YouTube youtube = new YouTube.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JacksonFactory.getDefaultInstance(),
                null
            )
            .setApplicationName(APPLICATION_NAME)
            .build();

            YouTube.PlaylistItems.List request = youtube.playlistItems()
                .list(List.of("snippet", "contentDetails"))
                .setPlaylistId(playlistId)
                .setMaxResults((long) maxResults)
                .setKey(youTubeProperties.getApiKey());

            PlaylistItemListResponse response = request.execute();
            List<PlaylistItem> items = response.getItems();

            List<Map<String, String>> videos = new ArrayList<>();
            
            for (PlaylistItem item : items) {
                Map<String, String> video = new HashMap<>();
                video.put("videoId", item.getContentDetails().getVideoId());
                video.put("title", item.getSnippet().getTitle());
                video.put("thumbnail", item.getSnippet().getThumbnails().getMedium().getUrl());
                video.put("publishedAt", item.getSnippet().getPublishedAt().toString());
                videos.add(video);
            }

            log.info("YouTube 영상 {}개 조회 완료", videos.size());
            return videos;
            
        } catch (Exception e) {
            log.error("YouTube API 호출 실패: playlistId={}", playlistId, e);
            return List.of(); // 빈 리스트 반환
        }
    }

    /**
     * 채널 ID로 최신 영상 N개 조회 (업로드 재생목록 사용)
     * @param channelId 채널 ID (UC...)
     * @param maxResults 조회할 영상 개수
     * @return 영상 정보 리스트
     */
    @Cacheable(value = "youtubeChannelVideos", key = "#channelId + '_' + #maxResults", unless = "#result == null || #result.isEmpty()")
    public List<Map<String, String>> getLatestVideosByChannel(String channelId, int maxResults) {
        String uploadPlaylistId = getUploadPlaylistId(channelId);
        return getLatestVideos(uploadPlaylistId, maxResults);
    }

    /**
     * 채널 ID로부터 업로드 재생목록 ID 가져오기
     * - 채널 ID가 "UC..."로 시작하면 "UU..."로 변경
     */
    private String getUploadPlaylistId(String channelId) {
        if (channelId.startsWith("UC")) {
            return "UU" + channelId.substring(2);
        }
        return channelId;
    }
}
