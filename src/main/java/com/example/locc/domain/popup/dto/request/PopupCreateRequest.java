package com.example.locc.domain.popup.dto.request;

import com.example.locc.domain.popup.dto.command.PopupCreateCommand;
import com.example.locc.domain.popup.entity.TargetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

/**
 * 팝업 생성 Request
 */
@Getter
@Setter
public class PopupCreateRequest {

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

    private Integer priority = 0;

    private Integer popupWidth = 500;

    private Integer popupHeight = 400;

    private Integer positionX = 100;

    private Integer positionY = 100;

    @NotNull(message = "노출 대상을 선택해주세요")
    private TargetType targetType = TargetType.ALL;

    private String imageUrl;

    /** javascript: 등 위험한 프로토콜 주입 방지 — http/https 또는 빈값만 허용 */
    @Pattern(
        regexp = "^(https?://.+)?$",
        message = "링크 URL은 http 또는 https로 시작해야 합니다"
    )
    private String linkUrl;

    /**
     * Request → Command 변환
     */
    public PopupCreateCommand toCommand() {
        return PopupCreateCommand.builder()
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
