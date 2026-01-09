package com.example.locc.domain.admin.dto.response;

import com.example.locc.domain.admin.dto.internal.ContentSummaryItem;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 콘텐츠 도메인별 요약 정보
 * - Phase 3 대시보드에서 사용
 */
@Getter
@Builder
public class ContentSummaryResponse {
    
    private String domainType;      // "NOTICE"
    private String domainName;      // "공지사항"
    private Long totalCount;        // 전체 개수
    private Long recentCount;       // 최근 7일 등록 수
    private List<ContentSummaryItem> recentItems;  // 최근 5개
    private String listUrl;         // 전체보기 URL
    
    public static ContentSummaryResponse of(
            String domainType,
            String domainName,
            Long totalCount,
            Long recentCount,
            List<ContentSummaryItem> recentItems,
            String listUrl) {
        return ContentSummaryResponse.builder()
                .domainType(domainType)
                .domainName(domainName)
                .totalCount(totalCount)
                .recentCount(recentCount)
                .recentItems(recentItems)
                .listUrl(listUrl)
                .build();
    }
}
