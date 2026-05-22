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
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
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
    private static final ZoneId KST = ZoneId.of("Asia/Seoul");

    public VisitorStatisticsResponse getVisitorStatistics() {
        log.debug("방문자 통계 조회");

        LocalDate today = LocalDate.now(KST);
        LocalDate yesterday = today.minusDays(1);
        LocalDate weekAgo = today.minusDays(7);
        
        // 오늘: Redis에서 실시간 조회 (Redis 장애 시 0 반환)
        Long todayCount;
        try {
            todayCount = counterService.getTodayVisitCount();
        } catch (Exception e) {
            log.warn("Redis 조회 실패 — 오늘 방문자 수 0으로 대체: {}", e.getMessage());
            todayCount = 0L;
        }
        
        // 어제: DB에서 조회
        Long yesterdayCount = repository.findByStatDate(yesterday)
                .map(VisitorStatistics::getVisitCount)
                .map(Integer::longValue)
                .orElse(0L);
        
        // 주간: DB에서 합산 + 오늘 Redis 데이터 포함
        List<VisitorStatistics> weeklyStats = repository.findRecentStatistics(weekAgo);
        Long weekCount = weeklyStats.stream()
                .mapToLong(VisitorStatistics::getVisitCount)
                .sum() + todayCount;

        // 주간 추이: DB 데이터 수집
        List<ChartDataPoint> weeklyData = new ArrayList<>(weeklyStats.stream()
                .map(stat -> ChartDataPoint.builder()
                        .date(stat.getStatDate())
                        .count(stat.getVisitCount())
                        .build())
                .collect(Collectors.toList()));

        // 오늘 데이터가 DB에 아직 없으면 Redis 실시간 값으로 보완
        boolean todayInDb = weeklyStats.stream().anyMatch(s -> s.getStatDate().equals(today));
        if (!todayInDb) {
            weeklyData.add(ChartDataPoint.builder()
                    .date(today)
                    .count(todayCount.intValue())
                    .build());
        }
        weeklyData.sort(Comparator.comparing(ChartDataPoint::getDate));
        
        return VisitorStatisticsResponse.builder()
                .todayCount(todayCount)
                .yesterdayCount(yesterdayCount)
                .weekCount(weekCount)
                .weeklyData(weeklyData)
                .build();
    }
}
