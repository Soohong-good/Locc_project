package com.example.locc.domain.notice.dto.response;

import com.example.locc.domain.notice.entity.Notice;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Notice 목록 조회 응답 DTO (API 전용)
 * - 목록에서는 최소한의 정보만 포함
 */
@Getter
@Builder
public class NoticeResponse {

    /** content HTML에서 첫 번째 &lt;img src&gt; 추출용 */
    private static final Pattern IMG_SRC_PATTERN =
            Pattern.compile("<img[^>]+src\\s*=\\s*[\"']([^\"']+)[\"']", Pattern.CASE_INSENSITIVE);

    private final Long id;
    private final String title;
    private final Boolean isPinned;
    private final Integer viewCount;
    private final String authorName;
    private final String authorId;   // 작성자 UUID — 프론트 본인 여부 판단용
    private final String authorRole; // ADMIN/OPERATOR/USER — 프론트에서 "관리자" 표기 판단용
    private final LocalDateTime createdAt;
    private final boolean isNew;
    private final boolean hasAttachments; // 첨부파일 존재 여부
    private final String thumbnailUrl;    // 본문 첫 이미지 URL (없으면 null)
    
    /**
     * Entity to Response (목록용 - 간소화)
     * @param notice Notice 엔티티
     * @param hasAttachments 첨부파일 존재 여부 (외부에서 계산)
     */
    public static NoticeResponse from(Notice notice, boolean hasAttachments) {
        return NoticeResponse.builder()
                .id(notice.getId())
                .title(notice.getTitle())
                .isPinned(notice.getIsPinned())
                .viewCount(notice.getViewCount())
                .authorName(notice.getAuthor() != null ? notice.getAuthor().getName() : "알 수 없음")
                .authorId(notice.getAuthor() != null ? notice.getAuthor().getId().toString() : null)
                .authorRole(notice.getAuthor() != null ? notice.getAuthor().getRole().name() : null)
                .createdAt(notice.getCreatedAt())
                .isNew(isNew(notice.getCreatedAt()))
                .hasAttachments(hasAttachments)
                .thumbnailUrl(extractFirstImageUrl(notice.getContent()))
                .build();
    }

    /**
     * HTML content에서 첫 번째 &lt;img&gt; src 값 추출
     * Quill 에디터 출력 형태: &lt;img src="/api/notices/images/xxx.jpg"&gt;
     */
    private static String extractFirstImageUrl(String content) {
        if (content == null || content.isBlank()) return null;
        Matcher m = IMG_SRC_PATTERN.matcher(content);
        return m.find() ? m.group(1) : null;
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
