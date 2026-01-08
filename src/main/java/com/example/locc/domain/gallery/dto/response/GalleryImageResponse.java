package com.example.locc.domain.gallery.dto.response;

import com.example.locc.domain.gallery.entity.GalleryImage;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * 갤러리 목록용 Response (썸네일 위주)
 */
public record GalleryImageResponse(
        Long id,
        String title,          // 제목 = 앨범 그룹화
        String description,
        String thumbnailFilename,
        String storedFilename,
        Integer viewCount,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        LocalDateTime createdAt
) {
    public static GalleryImageResponse from(GalleryImage image) {
        return new GalleryImageResponse(
                image.getId(),
                image.getTitle(),
                image.getDescription(),
                image.getThumbnailFilename(),
                image.getStoredFilename(),
                image.getViewCount(),
                image.getCreatedAt()
        );
    }
}
