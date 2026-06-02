package com.example.locc.domain.praisesheet.dto.response;

import com.example.locc.domain.praisesheet.entity.PraiseSheet;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Getter
@Builder
public class PraiseSheetResponse {

    private static final Pattern IMG_SRC_PATTERN =
            Pattern.compile("<img[^>]+src\\s*=\\s*[\"']([^\"']+)[\"']", Pattern.CASE_INSENSITIVE);

    private final Long id;
    private final String title;
    private final Boolean isPinned;
    private final Integer viewCount;
    private final String authorName;
    private final String authorId;
    private final LocalDateTime createdAt;
    private final boolean isNew;
    private final boolean hasAttachments;
    private final String thumbnailUrl;

    public static PraiseSheetResponse from(PraiseSheet ps, boolean hasAttachments) {
        return PraiseSheetResponse.builder()
                .id(ps.getId())
                .title(ps.getTitle())
                .isPinned(ps.getIsPinned())
                .viewCount(ps.getViewCount())
                .authorName(ps.getAuthor() != null ? ps.getAuthor().getName() : "알 수 없음")
                .authorId(ps.getAuthor() != null ? ps.getAuthor().getId().toString() : null)
                .createdAt(ps.getCreatedAt())
                .isNew(ChronoUnit.DAYS.between(ps.getCreatedAt(), LocalDateTime.now()) <= 3)
                .hasAttachments(hasAttachments)
                .thumbnailUrl(extractFirstImageUrl(ps.getContent()))
                .build();
    }

    private static String extractFirstImageUrl(String content) {
        if (content == null || content.isBlank()) return null;
        Matcher m = IMG_SRC_PATTERN.matcher(content);
        return m.find() ? m.group(1) : null;
    }
}
