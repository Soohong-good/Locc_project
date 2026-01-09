package com.example.locc.domain.admin.dto.internal;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 대시보드 콘텐츠 요약 항목
 * - 공통 필드만 포함 (도메인 특화 필드 없음)
 * - Phase 3 대시보드에서 사용
 */
@Getter
@Builder
public class ContentSummaryItem {
    
    private Long id;
    private String title;
    private String author;
    private LocalDateTime createdAt;
    private Long viewCount;
    private String detailUrl;
}
