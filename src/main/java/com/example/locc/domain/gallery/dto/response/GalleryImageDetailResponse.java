package com.example.locc.domain.gallery.dto.response;

import com.example.locc.domain.gallery.entity.GalleryImage;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * 갤러리 상세용 Response (전체 정보)
 */
public record GalleryImageDetailResponse(
        Long id,
        String departmentCode,
        String departmentName,
        String uploaderName,
        String title,          // 제목 = 앨범 그룹화
        String description,
        String originalFilename,
        String storedFilename,
        String thumbnailFilename,
        Long fileSize,
        Integer displayOrder,
        Integer viewCount,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        LocalDateTime createdAt,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        LocalDateTime updatedAt
) {
    public static GalleryImageDetailResponse from(GalleryImage image) {
        return new GalleryImageDetailResponse(
                image.getId(),
                image.getDepartment().getCode(),
                image.getDepartment().getName(),
                image.getUploader().getName(),
                image.getTitle(),
                image.getDescription(),
                image.getOriginalFilename(),
                image.getStoredFilename(),
                image.getThumbnailFilename(),
                image.getFileSize(),
                image.getDisplayOrder(),
                image.getViewCount(),
                image.getCreatedAt(),
                image.getUpdatedAt()
        );
    }
}
