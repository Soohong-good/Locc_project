package com.example.locc.domain.popup.dto.response;

import com.example.locc.domain.popup.entity.Popup;
import com.example.locc.domain.popup.entity.TargetType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 팝업 상세 Response
 */
@Getter
@Builder
public class PopupDetailResponse {
    private Long id;
    private String title;
    private String content;
    private LocalDateTime displayStartDate;
    private LocalDateTime displayEndDate;
    private Integer priority;
    private Boolean isActive;
    private Integer popupWidth;
    private Integer popupHeight;
    private Integer positionX;
    private Integer positionY;
    private TargetType targetType;
    private String targetTypeDescription;
    private String imageUrl;
    private String linkUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdByName;
    private String updatedByName;

    /**
     * Entity → DetailResponse 변환 (상세용)
     */
    public static PopupDetailResponse from(Popup popup) {
        return PopupDetailResponse.builder()
                .id(popup.getId())
                .title(popup.getTitle())
                .content(popup.getContent())
                .displayStartDate(popup.getDisplayStartDate())
                .displayEndDate(popup.getDisplayEndDate())
                .priority(popup.getPriority())
                .isActive(popup.getIsActive())
                .popupWidth(popup.getPopupWidth())
                .popupHeight(popup.getPopupHeight())
                .positionX(popup.getPositionX())
                .positionY(popup.getPositionY())
                .targetType(popup.getTargetType())
                .targetTypeDescription(popup.getTargetType().getDescription())
                .imageUrl(popup.getImageUrl())
                .linkUrl(popup.getLinkUrl())
                .createdAt(popup.getCreatedAt())
                .updatedAt(popup.getUpdatedAt())
                .createdByName(popup.getCreatedBy() != null ? popup.getCreatedBy().getName() : "알 수 없음")
                .updatedByName(popup.getUpdatedBy() != null ? popup.getUpdatedBy().getName() : "알 수 없음")
                .build();
    }
}
