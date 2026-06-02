package com.example.locc.domain.praisesheet.dto.request;

import com.example.locc.domain.praisesheet.dto.command.PraiseSheetCreateCommand;
import com.example.locc.domain.praisesheet.dto.command.PraiseSheetUpdateCommand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PraiseSheetRequest {

    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 200, message = "제목은 200자를 초과할 수 없습니다")
    private String title;

    private String content;

    @Builder.Default
    private Boolean isPinned = false;

    private List<MultipartFile> files;

    public PraiseSheetCreateCommand toCreateCommand(String email) {
        return PraiseSheetCreateCommand.builder()
                .title(this.title).content(this.content)
                .isPinned(this.isPinned).files(this.files)
                .createdByEmail(email).build();
    }

    public PraiseSheetUpdateCommand toUpdateCommand(Long id, String email) {
        return PraiseSheetUpdateCommand.builder()
                .praiseSheetId(id).title(this.title).content(this.content)
                .isPinned(this.isPinned).files(this.files)
                .updatedByEmail(email).build();
    }
}
