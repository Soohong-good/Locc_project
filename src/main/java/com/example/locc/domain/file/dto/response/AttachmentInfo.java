package com.example.locc.domain.file.dto.response;

import com.example.locc.domain.file.entity.File;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 첨부파일 응답 DTO (API 외부 노출용)
 *
 * FileDto 대체 목적:
 *   - FileDto 는 storedFileName / filePath(서버 절대경로) / uploaderEmail 등
 *     서버 내부 정보를 그대로 노출하는 문제가 있었음
 *   - AttachmentInfo 는 클라이언트에 필요한 필드만 담고,
 *     다운로드 URL 을 미리 조립해 반환함
 *
 * 노출 필드:
 *   id               - 파일 삭제 등 API 호출 식별자
 *   originalFileName - 화면 표시용 파일명
 *   fileSize         - 파일 크기 표시용 (bytes)
 *   contentType      - MIME 타입 (아이콘 분기 등)
 *   category         - 파일 카테고리 문자열 (ATTACHMENT / THUMBNAIL 등)
 *   uploaderName     - 작성자 이름 (이메일 제외)
 *   downloadUrl      - 인증 필요 다운로드 경로 /api/files/download/{id}
 *   createdAt        - 업로드 일시
 */
@Getter
@Builder
public class AttachmentInfo {

    private final Long id;
    private final String originalFileName;
    private final Long fileSize;
    private final String contentType;
    private final String category;
    private final String uploaderName;
    private final String downloadUrl;
    private final LocalDateTime createdAt;

    public static AttachmentInfo from(File file) {
        return from(file, "");
    }

    public static AttachmentInfo from(File file, String baseUrl) {
        String prefix = (baseUrl == null || baseUrl.isBlank()) ? "" : baseUrl.stripTrailing();

        return AttachmentInfo.builder()
                .id(file.getId())
                .originalFileName(file.getOriginalFileName())
                .fileSize(file.getFileSize())
                .contentType(file.getContentType())
                .category(file.getCategory() != null ? file.getCategory().name() : null)
                .uploaderName(file.getUploadedBy() != null ? file.getUploadedBy().getName() : null)
                .downloadUrl(prefix + "/api/files/download/" + file.getId())
                .createdAt(file.getCreatedAt())
                .build();
    }
}
