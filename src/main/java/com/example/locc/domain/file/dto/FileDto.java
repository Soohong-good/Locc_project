package com.example.locc.domain.file.dto;

import com.example.locc.domain.file.entity.File;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * File 응답 DTO
 * - 파일 정보 전달용
 */
@Getter
@Builder
public class FileDto {

    private final Long id;
    private final String originalFileName;
    private final String storedFileName;
    private final String filePath;
    private final Long fileSize;
    private final String contentType;
    private final File.EntityType entityType;
    private final Long entityId;
    private final File.FileCategory category;
    private final String uploaderName;
    private final String uploaderEmail;
    private final LocalDateTime createdAt;

    /**
     * Entity -> DTO 변환
     */
    public static FileDto fromEntity(File file) {
        FileDtoBuilder builder = FileDto.builder()
                .id(file.getId())
                .originalFileName(file.getOriginalFileName())
                .storedFileName(file.getStoredFileName())
                .filePath(file.getFilePath())
                .fileSize(file.getFileSize())
                .contentType(file.getContentType())
                .entityType(file.getEntityType())
                .entityId(file.getEntityId())
                .category(file.getCategory())
                .createdAt(file.getCreatedAt());

        if (file.getUploadedBy() != null) {
            builder.uploaderName(file.getUploadedBy().getName())
                    .uploaderEmail(file.getUploadedBy().getEmail());
        }

        return builder.build();
    }
}
