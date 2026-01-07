package com.example.locc.domain.notice.dto.command;

import lombok.Builder;
import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Notice 수정 커맨드
 * Service 레이어에서 사용하는 내부 DTO
 */
@Getter
@Builder
public class NoticeUpdateCommand {
    
    private final Long noticeId;
    private final String title;
    private final String content;
    private final Boolean isPinned;
    private final String updatedByEmail;
    private final List<MultipartFile> files;
}
