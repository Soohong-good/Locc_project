package com.example.locc.domain.admin.dto.response;

import com.example.locc.domain.admin.dto.internal.ChartDataPoint;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 방문자 통계 응답
 * - Phase 4에서 구현
 */
@Getter
@Builder
public class VisitorStatisticsResponse {
    
    private Long todayCount;        // 오늘 방문자 수
    private Long yesterdayCount;    // 어제 방문자 수
    private Long weekCount;         // 주간 방문자 수
    private List<ChartDataPoint> weeklyData;  // 주간 추이 데이터
}
