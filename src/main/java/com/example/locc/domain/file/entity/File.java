package com.example.locc.domain.file.entity;

import com.example.locc.entity.BaseEntity;
import com.example.locc.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

/**
 * File 도메인 엔티티
 * - 전역 파일 관리 (Notice, Sermon, Gallery, Staff 등)
 * - EntityType과 EntityId로 소속 관리
 */
@Entity
@Table(name = "files", indexes = {
        @Index(name = "idx_entity_type_id", columnList = "entityType, entityId")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(access = AccessLevel.PRIVATE)
public class File extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String originalFileName;  // 원본 파일명

    @Column(nullable = false)
    private String storedFileName;    // 서버 저장 파일명 (UUID)

    @Column(nullable = false)
    private String filePath;          // 파일 경로

    @Column(nullable = false)
    private Long fileSize;            // 파일 크기 (bytes)

    @Column(length = 100)
    private String contentType;       // MIME 타입

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private EntityType entityType;    // 소속 엔티티 타입

    @Column(nullable = false)
    private Long entityId;            // 소속 엔티티 ID

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private FileCategory category;    // 파일 카테고리

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", columnDefinition = "BINARY(16)")
    private User uploadedBy;          // 업로드한 사용자

    /**
     * 파일이 속한 엔티티 타입
     */
    public enum EntityType {
        NOTICE("공지사항"),
        SERMON("설교"),
        GALLERY("갤러리"),
        DEPARTMENT("부서"),
        STAFF("교역자");

        private final String description;

        EntityType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 파일 카테고리 (용도)
     */
    public enum FileCategory {
        ATTACHMENT("첨부파일"),
        THUMBNAIL("썸네일"),
        CONTENT_IMAGE("본문 이미지"),
        PROFILE("프로필 사진"),
        MANUSCRIPT("설교 원고"),
        GALLERY_IMAGE("갤러리 이미지");

        private final String description;

        FileCategory(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    // ===== 팩토리 메서드 =====

    /**
     * File 생성
     */
    public static File create(
            String originalFileName,
            String storedFileName,
            String filePath,
            Long fileSize,
            String contentType,
            EntityType entityType,
            Long entityId,
            FileCategory category,
            User uploadedBy
    ) {
        return File.builder()
                .originalFileName(originalFileName)
                .storedFileName(storedFileName)
                .filePath(filePath)
                .fileSize(fileSize)
                .contentType(contentType)
                .entityType(entityType)
                .entityId(entityId)
                .category(category)
                .uploadedBy(uploadedBy)
                .build();
    }

    // ===== 비즈니스 메서드 =====

    /**
     * 파일 정보 업데이트 (필요 시)
     */
    public void updateEntityInfo(EntityType entityType, Long entityId) {
        this.entityType = entityType;
        this.entityId = entityId;
    }
}
