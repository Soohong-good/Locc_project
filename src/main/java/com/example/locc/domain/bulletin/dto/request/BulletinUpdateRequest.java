package com.example.locc.domain.bulletin.dto.request;

import com.example.locc.domain.bulletin.dto.command.BulletinUpdateCommand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * 주보 수정 요청 DTO
 * - @ModelAttribute 방식 (multipart/form-data)
 * - 파일(thumbnail)은 Controller에서 별도 @RequestParam으로 수신
 */
@Getter
@Setter
public class BulletinUpdateRequest {

    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 200, message = "제목은 200자를 초과할 수 없습니다")
    private String title;

    private String content;

    /**
     * Request → Command 변환
     * thumbnailUrl은 서비스에서 파일 업로드 후 결정하므로 여기서는 포함하지 않음
     */
    public BulletinUpdateCommand toUpdateCommand() {
        return BulletinUpdateCommand.builder()
                .title(this.title)
                .content(this.content)
                .build();
    }
}
