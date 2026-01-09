package com.example.locc.domain.admin.service;

import com.example.locc.domain.admin.dto.internal.ChartDataPoint;
import com.example.locc.domain.admin.dto.response.VisitorStatisticsResponse;
import com.example.locc.domain.admin.entity.VisitorStatistics;
import com.example.locc.domain.admin.repository.VisitorStatisticsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 관리자 통계 전문 조회 서비스
 * - Phase 4 구현 완료
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminStatisticsQueryService {
    
    private final VisitorCounterService counterService;
    private final VisitorStatisticsRepository repository;
    
    /**
     * 방문자 통계 조회
     */
    public VisitorStatisticsResponse getVisitorStatistics() {
        log.debug("방문자 통계 조회");
        
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate weekAgo = today.minusDays(7);
        
        // 오늘: Redis에서 실시간 조회
        Long todayCount = counterService.getTodayVisitCount();
        
        // 어제: DB에서 조회
        Long yesterdayCount = repository.findByStatDate(yesterday)
                .map(VisitorStatistics::getVisitCount)
                .map(Integer::longValue)
                .orElse(0L);
        
        // 주간: DB에서 합산
        List<VisitorStatistics> weeklyStats = repository.findRecentStatistics(weekAgo);
        Long weekCount = weeklyStats.stream()
                .mapToLong(VisitorStatistics::getVisitCount)
                .sum();
        
        // 주간 추이 데이터
        List<ChartDataPoint> weeklyData = weeklyStats.stream()
                .map(stat -> ChartDataPoint.builder()
                        .date(stat.getStatDate())
                        .count(stat.getVisitCount())
                        .build())
                .collect(Collectors.toList());
        
        return VisitorStatisticsResponse.builder()
                .todayCount(todayCount)
                .yesterdayCount(yesterdayCount)
                .weekCount(weekCount)
                .weeklyData(weeklyData)
                .build();
    }
}
