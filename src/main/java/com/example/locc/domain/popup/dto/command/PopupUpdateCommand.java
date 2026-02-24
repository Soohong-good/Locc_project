package com.example.locc.domain.popup.dto.command;

import com.example.locc.domain.popup.entity.TargetType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 팝업 수정 Command
 */
@Getter
@Builder
public class PopupUpdateCommand {
    private String title;
    private String content;
    private LocalDateTime displayStartDate;
    private LocalDateTime displayEndDate;
    private Integer priority;
    private Integer popupWidth;
    private Integer popupHeight;
    private Integer positionX;
    private Integer positionY;
    private TargetType targetType;
    private String imageUrl;
    private String linkUrl;
}
