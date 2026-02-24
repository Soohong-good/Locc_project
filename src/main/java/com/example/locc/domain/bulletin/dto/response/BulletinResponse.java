package com.example.locc.domain.bulletin.dto.response;

import com.example.locc.domain.bulletin.entity.Bulletin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 주보 목록 응답 DTO
 */
@Getter
@Builder
@AllArgsConstructor
public class BulletinResponse {
    private Long id;
    private String title;
    private String thumbnailUrl;
    private String authorName;
    private Integer viewCount;
    private LocalDateTime createdAt;

    public static BulletinResponse from(Bulletin bulletin) {
        return BulletinResponse.builder()
                .id(bulletin.getId())
                .title(bulletin.getTitle())
                .thumbnailUrl(bulletin.getThumbnailUrl())
                .authorName(bulletin.getAuthor() != null ? bulletin.getAuthor().getName() : "알 수 없음")
                .viewCount(bulletin.getViewCount())
                .createdAt(bulletin.getCreatedAt())
                .build();
    }
}
