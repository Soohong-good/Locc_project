package com.example.locc.domain.file.dto;

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
 *
 * 상대경로(from) vs 절대경로(from + baseUrl) 두 가지 방식 제공
 *   - 같은 도메인 배포 시  → from(file) 상대경로 사용
 *   - 개발 환경(프론트 :3000, 백 :8080) 또는 CDN 분리 시 → from(file, baseUrl) 절대경로 사용
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

    /** 인증 필요 다운로드 URL */
    private final String downloadUrl;

    /** 공개 이미지 URL (공개 카테고리가 아니면 null) */
    private final String imageUrl;

    // ───── 상대경로 (기본) ─────

    public static FileResponse from(File file) {
        return from(file, "");
    }

    // ───── 절대경로 (baseUrl prefix) ─────

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

    /**
     * 공개 이미지 카테고리 판별
     *   CONTENT_IMAGE  - 에디터 본문 삽입 이미지 (로그인 없이 열람 가능)
     *   THUMBNAIL      - PDF 썸네일 (공개 목록에 노출)
     *   GALLERY_IMAGE  - 갤러리 이미지 (공개 열람)
     */
    private static boolean isPublicImage(File.FileCategory category) {
        return category == File.FileCategory.CONTENT_IMAGE
                || category == File.FileCategory.THUMBNAIL
                || category == File.FileCategory.GALLERY_IMAGE;
    }
}
