package com.example.locc.domain.praisesheet.dto.response;

import com.example.locc.domain.praisesheet.entity.PraiseSheet;
import com.example.locc.domain.file.dto.response.AttachmentInfo;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Getter
@Builder
public class PraiseSheetDetailResponse {

    private final Long id;
    private final String title;
    private final String content;
    private final Boolean isPinned;
    private final Integer viewCount;
    private final String authorName;
    private final String authorEmail;
    private final String authorId;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
    private final List<AttachmentInfo> attachments;
    private final boolean isNew;

    public static PraiseSheetDetailResponse from(PraiseSheet ps, List<AttachmentInfo> files) {
        return PraiseSheetDetailResponse.builder()
                .id(ps.getId())
                .title(ps.getTitle())
                .content(ps.getContent())
                .isPinned(ps.getIsPinned())
                .viewCount(ps.getViewCount())
                .authorName(ps.getAuthor() != null ? ps.getAuthor().getName() : "알 수 없음")
                .authorEmail(ps.getAuthor() != null ? ps.getAuthor().getEmail() : null)
                .authorId(ps.getAuthor() != null ? ps.getAuthor().getId().toString() : null)
                .createdAt(ps.getCreatedAt())
                .updatedAt(ps.getUpdatedAt())
                .attachments(files)
                .isNew(ps.getCreatedAt() != null &&
                       ChronoUnit.DAYS.between(ps.getCreatedAt(), LocalDateTime.now()) <= 3)
                .build();
    }
}
