package com.example.locc.domain.popup.dto.response;

import com.example.locc.domain.popup.entity.Popup;
import com.example.locc.domain.popup.entity.TargetType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 팝업 목록 Response
 */
@Getter
@Builder
public class PopupResponse {
    private Long id;
    private String title;
    private String content;  // 팝업 내용 (HTML)
    private LocalDateTime displayStartDate;
    private LocalDateTime displayEndDate;
    private Integer priority;
    private Boolean isActive;
    private TargetType targetType;
    private String targetTypeDescription;
    private Integer popupWidth;
    private Integer popupHeight;
    private Integer positionX;
    private Integer positionY;
    private String imageUrl;
    private String linkUrl;
    private LocalDateTime createdAt;
    private String createdByName;

    /**
     * Entity → Response 변환 (목록용)
     */
    public static PopupResponse from(Popup popup) {
        return PopupResponse.builder()
                .id(popup.getId())
                .title(popup.getTitle())
                .content(popup.getContent())
                .displayStartDate(popup.getDisplayStartDate())
                .displayEndDate(popup.getDisplayEndDate())
                .priority(popup.getPriority())
                .isActive(popup.getIsActive())
                .targetType(popup.getTargetType())
                .targetTypeDescription(popup.getTargetType().getDescription())
                .popupWidth(popup.getPopupWidth())
                .popupHeight(popup.getPopupHeight())
                .positionX(popup.getPositionX())
                .positionY(popup.getPositionY())
                .imageUrl(popup.getImageUrl())
                .linkUrl(popup.getLinkUrl())
                .createdAt(popup.getCreatedAt())
                .createdByName(popup.getCreatedBy() != null ? popup.getCreatedBy().getName() : "알 수 없음")
                .build();
    }
}
