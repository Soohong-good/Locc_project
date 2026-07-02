package com.example.locc.domain.admin.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 대시보드 전체 응답
 */
@Getter
@Builder
public class DashboardResponse {

    private VisitorStatisticsResponse visitorStatistics;
    private List<ContentSummaryResponse> contentSummaries;

    // 회원 통계
    private Long totalUsers;
    private Long approvedUsers;
    private Long pendingUsers;

    /** 전월 대비 신규 가입자 증감률 (%) — 양수 증가, 음수 감소 */
    private Double memberGrowthRate;

    // 도움문의 통계
    private Long totalHelpRequests;
    private Long pendingHelpRequests;
    private Long inProgressHelpRequests;

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
