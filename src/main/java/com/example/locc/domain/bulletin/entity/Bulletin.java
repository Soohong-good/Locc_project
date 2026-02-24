package com.example.locc.domain.bulletin.entity;

import com.example.locc.domain.bulletin.dto.command.BulletinCreateCommand;
import com.example.locc.domain.bulletin.dto.command.BulletinUpdateCommand;
import com.example.locc.entity.BaseEntity;
import com.example.locc.domain.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Bulletin(주보) 도메인 엔티티
 * - 교회 주보 전용
 * - 불변성을 위해 Setter 제거
 * - 팩토리 메서드로 생성
 * - 비즈니스 로직을 Entity에 응집
 */
@Entity
@Table(name = "bulletin")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(access = AccessLevel.PRIVATE)
public class Bulletin extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 200, message = "제목은 200자를 초과할 수 없습니다")
    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", columnDefinition = "BINARY(16)")
    private User author;

    @Builder.Default
    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;

    @Column(length = 500)
    private String thumbnailUrl;      // 썸네일 URL (파일 서버 경로)

    @Column(name = "file_id")
    private Long fileId;              // 원본 파일 ID (다운로드용)

    // ===== 팩토리 메서드 =====
    
    /**
     * Bulletin 생성
     */
    public static Bulletin create(BulletinCreateCommand command, User author) {
        return Bulletin.builder()
                .title(command.getTitle())
                .content(command.getContent())
                .thumbnailUrl(command.getThumbnailUrl())
                .author(author)
                .viewCount(0)
                .build();
    }

    // ===== 비즈니스 메서드 =====
    
    /**
     * Bulletin 수정
     */
    public void update(BulletinUpdateCommand command) {
        this.title = command.getTitle();
        this.content = command.getContent();
        if (command.getThumbnailUrl() != null) {
            this.thumbnailUrl = command.getThumbnailUrl();
        }
    }

    /**
     * 파일 ID 설정
     */
    public void setFileId(Long fileId) {
        this.fileId = fileId;
    }

    /**
     * 조회수 증가
     */
    public void increaseViews() {
        this.viewCount++;
    }

    // ===== 권한 검증 =====
    
    /**
     * 작성자 확인
     */
    public boolean isAuthor(User user) {
        return this.author != null && this.author.equals(user);
    }

    /**
     * 수정 권한 확인 (작성자 또는 관리자)
     */
    public boolean canModify(User user) {
        return isAuthor(user) || user.isAdmin();
    }
}
