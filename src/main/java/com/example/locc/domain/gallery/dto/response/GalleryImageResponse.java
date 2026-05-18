package com.example.locc.domain.gallery.dto.response;

import com.example.locc.domain.gallery.entity.GalleryImage;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * 갤러리 목록용 Response (썸네일 위주)
 */
public record GalleryImageResponse(
        Long id,
        String title,
        String description,
        String thumbnailFilename,
        String storedFilename,
        String uploaderName,
        String uploaderId,     // 업로더 UUID — 프론트 본인 여부 판단용
        Integer imageCount,
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
                image.getUploader().getName(),
                image.getUploader().getId().toString(),
                1,
                image.getViewCount(),
                image.getCreatedAt()
        );
    }

    public static GalleryImageResponse from(GalleryImage image, int imageCount) {
        return new GalleryImageResponse(
                image.getId(),
                image.getTitle(),
                image.getDescription(),
                image.getThumbnailFilename(),
                image.getStoredFilename(),
                image.getUploader().getName(),
                image.getUploader().getId().toString(),
                imageCount,
                image.getViewCount(),
                image.getCreatedAt()
        );
    }
}
