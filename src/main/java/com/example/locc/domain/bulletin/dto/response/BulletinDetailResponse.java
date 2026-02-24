package com.example.locc.domain.bulletin.dto.response;

import com.example.locc.domain.bulletin.entity.Bulletin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 주보 상세 응답 DTO
 */
@Getter
@Builder
@AllArgsConstructor
public class BulletinDetailResponse {
    private Long id;
    private String title;
    private String content;
    private String thumbnailUrl;
    private Long fileId;              // 원본 파일 ID
    private String authorName;
    private Integer viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BulletinDetailResponse from(Bulletin bulletin) {
        return BulletinDetailResponse.builder()
                .id(bulletin.getId())
                .title(bulletin.getTitle())
                .content(bulletin.getContent())
                .thumbnailUrl(bulletin.getThumbnailUrl())
                .fileId(bulletin.getFileId())
                .authorName(bulletin.getAuthor() != null ? bulletin.getAuthor().getName() : "알 수 없음")
                .viewCount(bulletin.getViewCount())
                .createdAt(bulletin.getCreatedAt())
                .updatedAt(bulletin.getUpdatedAt())
                .build();
    }
}
