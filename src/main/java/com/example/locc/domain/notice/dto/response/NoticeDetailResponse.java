package com.example.locc.domain.notice.dto.response;

import com.example.locc.domain.notice.entity.Notice;
import com.example.locc.domain.file.dto.response.AttachmentInfo;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Notice 상세 조회 응답 DTO (API 전용)
 * - 목록 조회와 구분하여 더 많은 정보 포함
 */
@Getter
@Builder
public class NoticeDetailResponse {
    
    private final Long id;
    private final String title;
    private final String content;
    private final Boolean isPinned;
    private final Integer viewCount;
    
    // 작성자 정보
    private final String authorName;
    private final String authorEmail;
    private final String authorId;   // 프론트 본인 여부 판단용
    
    // 메타 정보
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
    
    // 첨부파일
    private final List<AttachmentInfo> attachments;
    
    // 추가 정보
    private final boolean isNew;

    // 이전/다음 글 네비게이션 (없으면 null)
    private final Long prevId;
    private final String prevTitle;
    private final LocalDateTime prevCreatedAt;
    private final Long nextId;
    private final String nextTitle;
    private final LocalDateTime nextCreatedAt;

    /**
     * Entity to Response (파일 정보 + 이전/다음 글 포함)
     */
    public static NoticeDetailResponse from(Notice notice, List<AttachmentInfo> files, Notice prev, Notice next) {
        return NoticeDetailResponse.builder()
                .id(notice.getId())
                .title(notice.getTitle())
                .content(notice.getContent())
                .isPinned(notice.getIsPinned())
                .viewCount(notice.getViewCount())
                .authorName(notice.getAuthor() != null ? notice.getAuthor().getName() : "알 수 없음")
                .authorEmail(notice.getAuthor() != null ? notice.getAuthor().getEmail() : null)
                .authorId(notice.getAuthor() != null ? notice.getAuthor().getId().toString() : null)
                .createdAt(notice.getCreatedAt())
                .updatedAt(notice.getUpdatedAt())
                .attachments(files)
                .isNew(isNew(notice.getCreatedAt()))
                .prevId(prev != null ? prev.getId() : null)
                .prevTitle(prev != null ? prev.getTitle() : null)
                .prevCreatedAt(prev != null ? prev.getCreatedAt() : null)
                .nextId(next != null ? next.getId() : null)
                .nextTitle(next != null ? next.getTitle() : null)
                .nextCreatedAt(next != null ? next.getCreatedAt() : null)
                .build();
    }

    /**
     * Entity to Response (파일 정보 포함, 이전/다음 글 없이)
     */
    public static NoticeDetailResponse from(Notice notice, List<AttachmentInfo> files) {
        return from(notice, files, null, null);
    }

    /**
     * Entity to Response (파일 정보 없이)
     */
    public static NoticeDetailResponse from(Notice notice) {
        return from(notice, null, null, null);
    }
    
    /**
     * 3일 이내 생성된 공지사항인지 확인
     */
    private static boolean isNew(LocalDateTime createdAt) {
        if (createdAt == null) {
            return false;
        }
        long daysBetween = ChronoUnit.DAYS.between(createdAt, LocalDateTime.now());
        return daysBetween <= 3;
    }
}
