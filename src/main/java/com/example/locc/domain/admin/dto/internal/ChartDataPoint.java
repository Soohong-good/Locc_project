package com.example.locc.domain.admin.dto.internal;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

/**
 * 차트 데이터 포인트
 * - Phase 3, 4에서 그래프 표시용
 */
@Getter
@Builder
public class ChartDataPoint {
    
    private LocalDate date;
    private Integer count;
}
