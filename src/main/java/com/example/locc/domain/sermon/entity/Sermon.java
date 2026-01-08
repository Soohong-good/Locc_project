package com.example.locc.domain.sermon.entity;

import com.example.locc.domain.sermon.dto.command.SermonCreateCommand;
import com.example.locc.domain.sermon.dto.command.SermonUpdateCommand;
import com.example.locc.entity.BaseEntity;
import com.example.locc.domain.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

/**
 * Sermon 도메인 엔티티
 * - 불변성을 위해 Setter 제거
 * - 팩토리 메서드로 생성
 * - 비즈니스 로직을 Entity에 응집
 */
@Entity
@Table(name = "sermon")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(access = AccessLevel.PRIVATE)
public class Sermon extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "설교 제목은 필수입니다")
    @Size(max = 200, message = "제목은 200자를 초과할 수 없습니다")
    @Column(nullable = false, length = 200)
    private String title;

    @Size(max = 100, message = "본문은 100자를 초과할 수 없습니다")
    @Column(length = 100)
    private String scripture;

    @Size(max = 50, message = "설교자명은 50자를 초과할 수 없습니다")
    @Column(length = 50)
    private String preacher;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 500)
    private String audioUrl;

    @Column(length = 500)
    private String videoUrl;

    @Column(length = 500)
    private String thumbnailUrl;

    @Column
    private LocalDate sermonDate;

    @Size(max = 50, message = "카테고리는 50자를 초과할 수 없습니다")
    @Column(length = 50)
    private String category;  // 주일예배, 수요예배, 금요예배, 특별예배 등

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", columnDefinition = "BINARY(16)")
    private User author;

    // ===== 팩토리 메서드 =====
    
    /**
     * Sermon 생성
     */
    public static Sermon create(SermonCreateCommand command, User author) {
        return Sermon.builder()
                .title(command.getTitle())
                .scripture(command.getScripture())
                .preacher(command.getPreacher())
                .content(command.getContent())
                .audioUrl(command.getAudioUrl())
                .videoUrl(command.getVideoUrl())
                .thumbnailUrl(command.getThumbnailUrl())
                .sermonDate(command.getSermonDate())
                .category(command.getCategory())
                .author(author)
                .build();
    }

    // ===== 비즈니스 메서드 =====
    
    /**
     * Sermon 수정
     */
    public void update(SermonUpdateCommand command) {
        this.title = command.getTitle();
        this.scripture = command.getScripture();
        this.preacher = command.getPreacher();
        this.content = command.getContent();
        this.audioUrl = command.getAudioUrl();
        this.videoUrl = command.getVideoUrl();
        this.thumbnailUrl = command.getThumbnailUrl();
        this.sermonDate = command.getSermonDate();
        this.category = command.getCategory();
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
