package com.example.locc.domain.choir.dto.response;

import com.example.locc.domain.choir.entity.ChoirVideo;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class ChoirVideoResponse {

    private final Long id;
    private final String title;
    private final String videoUrl;
    private final String thumbnailUrl;
    private final LocalDate publishedAt;
    private final String choirName;

    public static ChoirVideoResponse from(ChoirVideo entity) {
        return ChoirVideoResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .videoUrl(entity.getVideoUrl())
                .thumbnailUrl(entity.getThumbnailUrl())
                .publishedAt(entity.getPublishedAt())
                .choirName(entity.getChoirName())
                .build();
    }
}
