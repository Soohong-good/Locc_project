package com.example.locc.domain.praisesheet.dto.command;

import lombok.Builder;
import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Builder
public class PraiseSheetCreateCommand {
    private final String title;
    private final String content;
    private final Boolean isPinned;
    private final String createdByEmail;
    private final List<MultipartFile> files;

    public PraiseSheetCreateCommand withDefaults() {
        return PraiseSheetCreateCommand.builder()
                .title(this.title)
                .content(this.content)
                .isPinned(this.isPinned != null ? this.isPinned : false)
                .createdByEmail(this.createdByEmail)
                .files(this.files)
                .build();
    }
}
