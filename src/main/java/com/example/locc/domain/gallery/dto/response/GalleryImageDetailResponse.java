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
        String uploaderId,     // 업로더 UUID — 프론트 본인 여부 판단용
        String title,
        String description,
        String originalFilename,
        String storedFilename,
        String thumbnailFilename,
        Long fileSize,
        Integer displayOrder,
        String groupId,
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
                image.getUploader().getId().toString(),
                image.getTitle(),
                image.getDescription(),
                image.getOriginalFilename(),
                image.getStoredFilename(),
                image.getThumbnailFilename(),
                image.getFileSize(),
                image.getDisplayOrder(),
                image.getGroupId(),
                image.getViewCount(),
                image.getCreatedAt(),
                image.getUpdatedAt()
        );
    }
}
