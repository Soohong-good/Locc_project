package com.example.locc.domain.praisesheet.dto.command;

import lombok.Builder;
import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Builder
public class PraiseSheetUpdateCommand {
    private final Long praiseSheetId;
    private final String title;
    private final String content;
    private final Boolean isPinned;
    private final String updatedByEmail;
    private final List<MultipartFile> files;
}
