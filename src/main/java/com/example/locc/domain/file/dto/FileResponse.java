package com.example.locc.domain.file.dto;

import com.example.locc.domain.file.entity.File;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * File API 응답 DTO
 *
 * 설계 원칙:
 * - filePath(서버 내부 경로) 미포함 (보안)
 * - 프론트가 사용할 URL 필드 제공
 *   - downloadUrl : 인증 필요 첨부파일 다운로드 (/api/files/download/{id})
 *   - imageUrl    : 공개 이미지 접근 (/api/files/image/{id}), CONTENT_IMAGE/THUMBNAIL/GALLERY_IMAGE 전용
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

    // 프론트에서 직접 사용할 URL
    private final String downloadUrl;   // 인증 필요 다운로드용
    private final String imageUrl;      // 공개 이미지용 (null이면 공개 접근 불가)

    public static FileResponse from(File file) {
        String downloadUrl = "/api/files/download/" + file.getId();
        String imageUrl = isPublicImage(file.getCategory())
                ? "/api/files/image/" + file.getId()
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

    /**
     * 공개 이미지 카테고리 판별
     * - CONTENT_IMAGE: 에디터 본문 삽입 이미지 (로그인 없이 열람 가능해야 함)
     * - THUMBNAIL: PDF 썸네일 (공개 목록에 노출)
     * - GALLERY_IMAGE: 갤러리 이미지 (공개 열람)
     */
    private static boolean isPublicImage(File.FileCategory category) {
        return category == File.FileCategory.CONTENT_IMAGE
                || category == File.FileCategory.THUMBNAIL
                || category == File.FileCategory.GALLERY_IMAGE;
    }
}
