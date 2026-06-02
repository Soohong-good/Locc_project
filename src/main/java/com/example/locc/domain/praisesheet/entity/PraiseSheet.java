package com.example.locc.domain.praisesheet.entity;

import com.example.locc.domain.praisesheet.dto.command.PraiseSheetCreateCommand;
import com.example.locc.domain.praisesheet.dto.command.PraiseSheetUpdateCommand;
import com.example.locc.entity.BaseEntity;
import com.example.locc.domain.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "praise_sheet")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(access = AccessLevel.PRIVATE)
public class PraiseSheet extends BaseEntity {

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

    public static PraiseSheet create(PraiseSheetCreateCommand command, User author) {
        return PraiseSheet.builder()
                .title(command.getTitle())
                .content(command.getContent())
                .isPinned(command.getIsPinned() != null ? command.getIsPinned() : false)
                .author(author)
                .viewCount(0)
                .build();
    }

    public void update(PraiseSheetUpdateCommand command) {
        this.title = command.getTitle();
        this.content = command.getContent();
        if (command.getIsPinned() != null) this.isPinned = command.getIsPinned();
    }

    public void increaseViews() { this.viewCount++; }
    public void togglePin()     { this.isPinned = !this.isPinned; }

    public boolean canModify(User user) {
        return (this.author != null && this.author.equals(user)) || user.isAdmin();
    }
}
