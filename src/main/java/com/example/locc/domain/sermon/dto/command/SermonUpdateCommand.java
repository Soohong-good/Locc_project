package com.example.locc.domain.sermon.dto.command;

import lombok.Builder;
import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

/**
 * Sermon 수정 커맨드
 * Service 레이어에서 사용하는 내부 DTO
 */
@Getter
@Builder
public class SermonUpdateCommand {
    
    private final Long sermonId;
    private final String title;
    private final String scripture;
    private final String preacher;
    private final String content;
    private final String audioUrl;
    private final String videoUrl;
    private final String thumbnailUrl;
    private final LocalDate sermonDate;
    private final String category;
    private final Integer serviceNumber;  // 1부, 2부 구분
    private final String updatedByEmail;
    private final List<MultipartFile> files;
}
