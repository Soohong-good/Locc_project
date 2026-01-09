package com.example.locc.domain.admin.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 대시보드 전체 응답
 * - Phase 3에서 실제 데이터 연동
 */
@Getter
@Builder
public class DashboardResponse {
    
    private VisitorStatisticsResponse visitorStatistics;
    private List<ContentSummaryResponse> contentSummaries;
    private LocalDateTime generatedAt;
    
    public static DashboardResponse of(
            VisitorStatisticsResponse visitorStats,
            List<ContentSummaryResponse> contentSummaries) {
        return DashboardResponse.builder()
                .visitorStatistics(visitorStats)
                .contentSummaries(contentSummaries)
                .generatedAt(LocalDateTime.now())
                .build();
    }
}
