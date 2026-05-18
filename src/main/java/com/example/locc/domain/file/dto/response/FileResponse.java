package com.example.locc.domain.file.dto.response;

import com.example.locc.domain.file.entity.File;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * File API 응답 DTO
 *
 * URL 정책:
 *   downloadUrl  : 인증 필요 다운로드  /api/files/download/{id}
 *   imageUrl     : 공개 이미지 접근   /api/files/image/{id}  (null이면 공개 접근 불가)
 */
@Getter
@Builder
public class FileResponse {

    private final Long id;
    private final String originalFileName;
    private final Long fileSize;
    private final String contentType;
    private final File.EntityType entityType;
    private final Long entityId;
    private final File.FileCategory category;
    private final String uploaderName;
    private final LocalDateTime createdAt;
    private final String downloadUrl;
    private final String imageUrl;

    public static FileResponse from(File file) {
        return from(file, "");
    }

    public static FileResponse from(File file, String baseUrl) {
        String prefix = (baseUrl == null || baseUrl.isBlank()) ? "" : baseUrl.stripTrailing();

        String downloadUrl = prefix + "/api/files/download/" + file.getId();
        String imageUrl = isPublicImage(file.getCategory())
                ? prefix + "/api/files/image/" + file.getId()
                : null;

        String uploaderName = file.getUploadedBy() != null
                ? file.getUploadedBy().getName()
                : null;

        return FileResponse.builder()
                .id(file.getId())
                .originalFileName(file.getOriginalFileName())
                .fileSize(file.getFileSize())
                .contentType(file.getContentType())
                .entityType(file.getEntityType())
                .entityId(file.getEntityId())
                .category(file.getCategory())
                .uploaderName(uploaderName)
                .createdAt(file.getCreatedAt())
                .downloadUrl(downloadUrl)
                .imageUrl(imageUrl)
                .build();
    }

    private static boolean isPublicImage(File.FileCategory category) {
        return category == File.FileCategory.CONTENT_IMAGE
                || category == File.FileCategory.THUMBNAIL
                || category == File.FileCategory.GALLERY_IMAGE;
    }
}
