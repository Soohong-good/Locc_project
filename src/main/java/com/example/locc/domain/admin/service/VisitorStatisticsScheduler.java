package com.example.locc.domain.admin.service;

import com.example.locc.domain.admin.entity.VisitorStatistics;
import com.example.locc.domain.admin.repository.VisitorStatisticsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;

/**
 * 방문자 통계 배치 스케줄러
 * - Phase 4 활성화
 * - Redis → DB flush
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class VisitorStatisticsScheduler {
    
    private final VisitorCounterService counterService;
    private final VisitorStatisticsRepository repository;

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    
    /**
     * Redis의 현재 누적 카운트를 DB에 스냅샷으로 저장
     * 5분마다 실행
     */
    @Scheduled(cron = "0 */5 * * * *")
    @Transactional
    public void flushToDatabase() {
        LocalDate today = LocalDate.now(KST);

        Long visitCount;
        Long pageViewCount;
        try {
            visitCount    = counterService.getVisitCount(today);
            pageViewCount = counterService.getPageViewCount(today);
        } catch (Exception e) {
            log.warn("방문자 통계 Redis 조회 실패, flush 스킵: {}", e.getMessage());
            return;
        }

        if (visitCount == 0 && pageViewCount == 0) {
            log.debug("방문자 데이터 없음, flush 스킵: {}", today);
            return;
        }

        VisitorStatistics stats = repository.findByStatDate(today)
            .orElse(VisitorStatistics.create(today));

        stats.setVisitCount(visitCount.intValue());
        stats.setPageViewCount(pageViewCount.intValue());

        repository.save(stats);

        log.info("방문자 통계 flush 완료: {} - visit: {}, pageView: {}", today, visitCount, pageViewCount);
    }
    
    /**
     * 자정에 어제 통계를 최종 확정
     * 매일 00:05 실행
     */
    @Scheduled(cron = "0 5 0 * * *")
    @Transactional
    public void finalizeYesterdayStats() {
        LocalDate yesterday = LocalDate.now(KST).minusDays(1);

        // Redis 장애 시 0으로 fallback (DB 기존 데이터 보존 로직으로 처리)
        long redisVisit = 0L;
        long redisPageView = 0L;
        try {
            redisVisit    = counterService.getVisitCount(yesterday);
            redisPageView = counterService.getPageViewCount(yesterday);
        } catch (Exception e) {
            log.warn("어제 통계 Redis 조회 실패 — DB 기존 데이터로 최종 확정: {}", e.getMessage());
        }

        VisitorStatistics existing = repository.findByStatDate(yesterday).orElse(null);

        // Redis와 DB 중 더 큰 값을 최종 확정
        // (23:55 flush 이후 자정까지의 5분 데이터가 Redis에 있을 수 있음)
        long finalVisit    = Math.max(redisVisit,    existing != null ? existing.getVisitCount()    : 0L);
        long finalPageView = Math.max(redisPageView, existing != null ? existing.getPageViewCount() : 0L);

        if (finalVisit == 0 && finalPageView == 0) {
            log.debug("어제 방문자 없음 (Redis·DB 모두 없음): {}", yesterday);
            return;
        }

        VisitorStatistics stats = existing != null ? existing : VisitorStatistics.create(yesterday);
        stats.setVisitCount((int) finalVisit);
        stats.setPageViewCount((int) finalPageView);
        repository.save(stats);

        log.info("어제 통계 최종 확정: {} - visit: {}, pageView: {}", yesterday, finalVisit, finalPageView);
    }
}
