package com.example.locc.domain.popup.entity;

import com.example.locc.domain.popup.dto.command.PopupCreateCommand;
import com.example.locc.domain.popup.dto.command.PopupUpdateCommand;
import com.example.locc.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 팝업 엔티티
 */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@Table(name = "popups")
public class Popup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @Column(nullable = false)
    private LocalDateTime displayStartDate;

    @Column(nullable = false)
    private LocalDateTime displayEndDate;

    @Column(nullable = false)
    private Integer priority = 0;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false)
    private Integer popupWidth = 500;

    @Column(nullable = false)
    private Integer popupHeight = 400;

    @Column(nullable = false)
    private Integer positionX = 100;

    @Column(nullable = false)
    private Integer positionY = 100;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TargetType targetType = TargetType.ALL;

    @Column(length = 500)
    private String imageUrl;

    @Column(length = 500)
    private String linkUrl;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @CreatedBy
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @LastModifiedBy
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    // ===== 정적 팩토리 메서드 =====

    /**
     * 팝업 생성
     */
    public static Popup create(PopupCreateCommand command, User creator) {
        Popup popup = new Popup();
        popup.title = command.getTitle();
        popup.content = command.getContent();
        popup.displayStartDate = command.getDisplayStartDate();
        popup.displayEndDate = command.getDisplayEndDate();
        popup.priority = command.getPriority() != null ? command.getPriority() : 0;
        popup.popupWidth = command.getPopupWidth() != null ? command.getPopupWidth() : 500;
        popup.popupHeight = command.getPopupHeight() != null ? command.getPopupHeight() : 400;
        popup.positionX = command.getPositionX() != null ? command.getPositionX() : 100;
        popup.positionY = command.getPositionY() != null ? command.getPositionY() : 100;
        popup.targetType = command.getTargetType() != null ? command.getTargetType() : TargetType.ALL;
        popup.imageUrl = command.getImageUrl();
        popup.linkUrl = command.getLinkUrl();
        popup.createdBy = creator;
        popup.isActive = true;
        return popup;
    }

    // ===== 비즈니스 메서드 =====

    /**
     * 팝업 수정
     */
    public void update(PopupUpdateCommand command) {
        this.title = command.getTitle();
        this.content = command.getContent();
        this.displayStartDate = command.getDisplayStartDate();
        this.displayEndDate = command.getDisplayEndDate();
        this.priority = command.getPriority();
        this.popupWidth = command.getPopupWidth();
        this.popupHeight = command.getPopupHeight();
        this.positionX = command.getPositionX();
        this.positionY = command.getPositionY();
        this.targetType = command.getTargetType();
        this.imageUrl = command.getImageUrl();
        this.linkUrl = command.getLinkUrl();
    }

    /**
     * 활성화 토글
     */
    public void toggleActive() {
        this.isActive = !this.isActive;
    }

    /**
     * 노출 가능 여부 판단
     */
    public boolean isDisplayable(LocalDateTime now, boolean isLoggedIn) {
        if (!isActive) {
            return false;
        }
        if (now.isBefore(displayStartDate)) {
            return false;
        }
        if (now.isAfter(displayEndDate)) {
            return false;
        }

        if (targetType == TargetType.MEMBER_ONLY && !isLoggedIn) {
            return false;
        }
        if (targetType == TargetType.GUEST_ONLY && isLoggedIn) {
            return false;
        }

        return true;
    }

    /**
     * 수정 권한 확인
     */
    public boolean canModify(User user) {
        if (user == null) {
            return false;
        }
        // 관리자 또는 작성자만 수정 가능
        return user.isAdmin() || (this.createdBy != null && this.createdBy.getId().equals(user.getId()));
    }
}
