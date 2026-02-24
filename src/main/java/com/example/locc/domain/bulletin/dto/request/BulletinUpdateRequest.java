package com.example.locc.domain.bulletin.dto.request;

import com.example.locc.domain.bulletin.dto.command.BulletinUpdateCommand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 주보 수정 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BulletinUpdateRequest {

    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 200, message = "제목은 200자를 초과할 수 없습니다")
    private String title;

    private String content;

    @Size(max = 500, message = "썸네일 URL은 500자를 초과할 수 없습니다")
    private String thumbnailUrl;

    /**
     * Request → Command 변환
     */
    public BulletinUpdateCommand toUpdateCommand() {
        return BulletinUpdateCommand.builder()
                .title(this.title)
                .content(this.content)
                .thumbnailUrl(this.thumbnailUrl)
                .build();
    }
}
