package com.example.locc.domain.popup.dto.request;

import com.example.locc.domain.popup.dto.command.PopupUpdateCommand;
import com.example.locc.domain.popup.entity.TargetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

/**
 * 팝업 수정 Request
 */
@Getter
@Setter
public class PopupUpdateRequest {

    @NotBlank(message = "제목을 입력해주세요")
    private String title;

    @NotBlank(message = "내용을 입력해주세요")
    private String content;

    @NotNull(message = "노출 시작일을 선택해주세요")
    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime displayStartDate;

    @NotNull(message = "노출 종료일을 선택해주세요")
    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime displayEndDate;

    @NotNull(message = "우선순위를 입력해주세요")
    private Integer priority;

    @NotNull(message = "팝업 너비를 입력해주세요")
    private Integer popupWidth;

    @NotNull(message = "팝업 높이를 입력해주세요")
    private Integer popupHeight;

    @NotNull(message = "X 좌표를 입력해주세요")
    private Integer positionX;

    @NotNull(message = "Y 좌표를 입력해주세요")
    private Integer positionY;

    @NotNull(message = "노출 대상을 선택해주세요")
    private TargetType targetType;

    private String imageUrl;

    private String linkUrl;

    /**
     * Request → Command 변환
     */
    public PopupUpdateCommand toCommand() {
        return PopupUpdateCommand.builder()
                .title(title)
                .content(content)
                .displayStartDate(displayStartDate)
                .displayEndDate(displayEndDate)
                .priority(priority)
                .popupWidth(popupWidth)
                .popupHeight(popupHeight)
                .positionX(positionX)
                .positionY(positionY)
                .targetType(targetType)
                .imageUrl(imageUrl)
                .linkUrl(linkUrl)
                .build();
    }
}
