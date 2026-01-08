package com.example.locc.domain.gallery.entity;

import com.example.locc.domain.department.entity.Department;
import com.example.locc.domain.gallery.dto.command.GalleryImageUpdateCommand;
import com.example.locc.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "gallery_image")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class GalleryImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploader_id", nullable = false)
    private User uploader;

    @Column(nullable = false, length = 200)
    private String title; // 제목 = 앨범 그룹화에 사용

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "original_filename", nullable = false)
    private String originalFilename;

    @Column(name = "stored_filename", nullable = false)
    private String storedFilename;

    @Column(name = "thumbnail_filename")
    private String thumbnailFilename;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(name = "view_count")
    private Integer viewCount = 0;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ===== 정적 팩토리 메서드 =====

    public static GalleryImage create(
            Department department,
            User uploader,
            String title,      // 제목 = 앨범명
            String description,
            String originalFilename,
            String storedFilename,
            String thumbnailFilename,
            Long fileSize,
            Integer displayOrder
    ) {
        GalleryImage image = new GalleryImage();
        image.department = department;
        image.uploader = uploader;
        image.title = title;
        image.description = description;
        image.originalFilename = originalFilename;
        image.storedFilename = storedFilename;
        image.thumbnailFilename = thumbnailFilename;
        image.fileSize = fileSize;
        image.displayOrder = displayOrder != null ? displayOrder : 0;
        image.viewCount = 0;
        return image;
    }

    // ===== 비즈니스 로직 =====

    /**
     * 이미지 정보 수정
     */
    public void update(GalleryImageUpdateCommand command) {
        this.title = command.title();
        this.description = command.description();
    }

    /**
     * 정렬 순서 변경
     */
    public void updateDisplayOrder(Integer newOrder) {
        this.displayOrder = newOrder;
    }

    /**
     * 조회수 증가
     */
    public void incrementViewCount() {
        this.viewCount++;
    }

    /**
     * 수정 권한 확인
     */
    public boolean canModify(User user) {
        return this.uploader.equals(user) || user.isAdmin();
    }
}
