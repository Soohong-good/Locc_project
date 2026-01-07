package com.example.locc.domain.notice.dto.command;

import lombok.Builder;
import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Notice 생성 커맨드
 * Service 레이어에서 사용하는 내부 DTO
 */
@Getter
@Builder
public class NoticeCreateCommand {
    
    private final String title;
    private final String content;
    private final Boolean isPinned;
    private final String createdByEmail;
    private final List<MultipartFile> files;
    
    /**
     * 기본값이 적용된 새 커맨드 생성
     */
    public NoticeCreateCommand withDefaults() {
        return NoticeCreateCommand.builder()
                .title(this.title)
                .content(this.content)
                .isPinned(this.isPinned != null ? this.isPinned : false)
                .createdByEmail(this.createdByEmail)
                .files(this.files)
                .build();
    }
}
