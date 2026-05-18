package com.example.locc.domain.notice.dto.request;

import com.example.locc.domain.notice.dto.command.NoticeCreateCommand;
import com.example.locc.domain.notice.dto.command.NoticeUpdateCommand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Notice 생성/수정 요청 DTO
 * - Controller 입력 전용 (웹/API에서 들어오는 원본)
 * - Validation은 여기서만
 * - Controller에서 Command로 변환
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticeRequest {

    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 200, message = "제목은 200자를 초과할 수 없습니다")
    private String title;

    @NotBlank(message = "내용은 필수입니다")
    private String content;

    @Builder.Default
    private Boolean isPinned = false;

    /**
     * 첨부파일 목록
     */
    private List<MultipartFile> files;

    public NoticeCreateCommand toCreateCommand(String createdByEmail) {
        return NoticeCreateCommand.builder()
                .title(this.title)
                .content(this.content)
                .isPinned(this.isPinned)
                .files(this.files)
                .createdByEmail(createdByEmail)
                .build();
    }

    public NoticeUpdateCommand toUpdateCommand(Long noticeId, String updatedByEmail) {
        return NoticeUpdateCommand.builder()
                .noticeId(noticeId)
                .title(this.title)
                .content(this.content)
                .isPinned(this.isPinned)
                .files(this.files)
                .updatedByEmail(updatedByEmail)
                .build();
    }
}
