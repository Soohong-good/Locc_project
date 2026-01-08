package com.example.locc.domain.sermon.dto.response;

import com.example.locc.domain.sermon.entity.Sermon;
import com.example.locc.domain.file.dto.FileDto;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Sermon 상세 조회 응답 DTO (API 전용)
 * - 목록 조회와 구분하여 더 많은 정보 포함
 */
@Getter
@Builder
public class SermonDetailResponse {
    
    private final Long id;
    private final String title;
    private final String scripture;
    private final String preacher;
    private final String content;
    private final String audioUrl;
    private final String videoUrl;
    private final String thumbnailUrl;
    private final LocalDate sermonDate;
    private final String category;
    
    // 작성자 정보
    private final String authorName;
    private final String authorEmail;
    
    // 메타 정보
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
    
    // 첨부파일
    private final List<FileDto> attachments;
    
    // 추가 정보
    private final boolean isNew;
    
    /**
     * Entity to Response (파일 정보 포함)
     */
    public static SermonDetailResponse from(Sermon sermon, List<FileDto> files) {
        return SermonDetailResponse.builder()
                .id(sermon.getId())
                .title(sermon.getTitle())
                .scripture(sermon.getScripture())
                .preacher(sermon.getPreacher())
                .content(sermon.getContent())
                .audioUrl(sermon.getAudioUrl())
                .videoUrl(sermon.getVideoUrl())
                .thumbnailUrl(sermon.getThumbnailUrl())
                .sermonDate(sermon.getSermonDate())
                .category(sermon.getCategory())
                .authorName(sermon.getAuthor() != null ? sermon.getAuthor().getName() : "알 수 없음")
                .authorEmail(sermon.getAuthor() != null ? sermon.getAuthor().getEmail() : null)
                .createdAt(sermon.getCreatedAt())
                .updatedAt(sermon.getUpdatedAt())
                .attachments(files)
                .isNew(isNew(sermon.getCreatedAt()))
                .build();
    }
    
    /**
     * Entity to Response (파일 정보 없이)
     */
    public static SermonDetailResponse from(Sermon sermon) {
        return from(sermon, null);
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
