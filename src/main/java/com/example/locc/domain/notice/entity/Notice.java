package com.example.locc.domain.notice.entity;

import com.example.locc.domain.notice.dto.command.NoticeCreateCommand;
import com.example.locc.domain.notice.dto.command.NoticeUpdateCommand;
import com.example.locc.entity.BaseEntity;
import com.example.locc.domain.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Notice 도메인 엔티티
 * - 불변성을 위해 Setter 제거
 * - 팩토리 메서드로 생성
 * - 비즈니스 로직을 Entity에 응집
 */
@Entity
@Table(name = "notice")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(access = AccessLevel.PRIVATE)
public class Notice extends BaseEntity {

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

    @Builder.Default
    @Column(nullable = false)
    private Boolean isPinned = false;

    // ===== 팩토리 메서드 =====
    
    /**
     * Notice 생성
     */
    public static Notice create(NoticeCreateCommand command, User author) {
        return Notice.builder()
                .title(command.getTitle())
                .content(command.getContent())
                .isPinned(command.getIsPinned() != null ? command.getIsPinned() : false)
                .author(author)
                .viewCount(0)
                .build();
    }

    // ===== 비즈니스 메서드 =====
    
    /**
     * Notice 수정
     */
    public void update(NoticeUpdateCommand command) {
        this.title = command.getTitle();
        this.content = command.getContent();
        if (command.getIsPinned() != null) {
            this.isPinned = command.getIsPinned();
        }
    }

    /**
     * 조회수 증가
     */
    public void increaseViews() {
        this.viewCount++;
    }

    /**
     * 고정
     */
    public void pin() {
        this.isPinned = true;
    }

    /**
     * 고정 해제
     */
    public void unpin() {
        this.isPinned = false;
    }

    /**
     * 고정 토글
     */
    public void togglePin() {
        this.isPinned = !this.isPinned;
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
