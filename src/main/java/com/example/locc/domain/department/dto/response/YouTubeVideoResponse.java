package com.example.locc.domain.department.dto.response;

import lombok.Getter;

@Getter
public class YouTubeVideoResponse {
    
    private final String videoId;
    private final String title;
    private final String channelId;

    private YouTubeVideoResponse(String videoId, String title, String channelId) {
        this.videoId = videoId;
        this.title = title;
        this.channelId = channelId;
    }

    public static YouTubeVideoResponse of(String videoId, String title, String channelId) {
        return new YouTubeVideoResponse(videoId, title, channelId);
    }
}
