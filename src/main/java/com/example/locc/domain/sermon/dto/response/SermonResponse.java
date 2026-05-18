package com.example.locc.domain.sermon.dto.response;

import com.example.locc.domain.sermon.entity.Sermon;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Sermon 목록 조회 응답 DTO (API 전용)
 * - 목록에서는 최소한의 정보만 포함
 */
@Getter
@Builder
public class SermonResponse {

    private final Long id;
    private final String title;
    private final String scripture;
    private final String preacher;
    private final LocalDate sermonDate;
    private final String category;
    private final Integer serviceNumber;  // 1부, 2부 구분
    private final String audioUrl;
    private final String videoUrl;
    private final String thumbnailUrl;
    private final String authorName;
    private final String authorId;   // 작성자 UUID — 프론트 본인 여부 판단용
    private final LocalDateTime createdAt;
    private final boolean isNew;
    
    /**
     * Entity to Response (목록용 - 간소화)
     */
    public static SermonResponse from(Sermon sermon) {
        return SermonResponse.builder()
                .id(sermon.getId())
                .title(sermon.getTitle())
                .scripture(sermon.getScripture())
                .preacher(sermon.getPreacher())
                .sermonDate(sermon.getSermonDate())
                .category(sermon.getCategory())
                .serviceNumber(sermon.getServiceNumber())
                .audioUrl(sermon.getAudioUrl())
                .videoUrl(sermon.getVideoUrl())
                .thumbnailUrl(sermon.getThumbnailUrl())
                .authorName(sermon.getAuthor() != null ? sermon.getAuthor().getName() : "알 수 없음")
                .authorId(sermon.getAuthor() != null ? sermon.getAuthor().getId().toString() : null)
                .createdAt(sermon.getCreatedAt())
                .isNew(isNew(sermon.getCreatedAt()))
                .build();
    }
    
    /**
     * 3일 이내 생성된 설교인지 확인
     */
    private static boolean isNew(LocalDateTime createdAt) {
        if (createdAt == null) {
            return false;
        }
        long daysBetween = ChronoUnit.DAYS.between(createdAt, LocalDateTime.now());
        return daysBetween <= 3;
    }
}
