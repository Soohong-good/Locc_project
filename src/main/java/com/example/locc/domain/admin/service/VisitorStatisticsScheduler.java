package com.example.locc.domain.admin.service;

import com.example.locc.domain.admin.entity.VisitorStatistics;
import com.example.locc.domain.admin.repository.VisitorStatisticsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * 방문자 통계 배치 스케줄러
 * - Phase 4에서 활성화
 * - Redis → DB flush
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class VisitorStatisticsScheduler {
    
    private final VisitorCounterService counterService;
    private final VisitorStatisticsRepository repository;
    
    /**
     * Redis의 현재 누적 카운트를 DB에 스냅샷으로 저장
     * Phase 4에서 @Scheduled 추가: @Scheduled(cron = "0 * * * * *")
     */
    // @Scheduled(cron = "0 */1 * * * *")  // Phase 4에서 주석 해제
    @Transactional
    public void flushToDatabase() {
        log.trace("방문자 통계 flush (Phase 4: 비활성화)");
        
        // Phase 4에서 주석 해제:
        // LocalDate today = LocalDate.now();
        // 
        // Long visitCount = counterService.getVisitCount(today);
        // Long pageViewCount = counterService.getPageViewCount(today);
        // 
        // if (visitCount == 0 && pageViewCount == 0) {
        //     log.debug("방문자 데이터 없음, flush 스킵: {}", today);
        //     return;
        // }
        // 
        // VisitorStatistics stats = repository.findByStatDate(today)
        //     .orElse(VisitorStatistics.create(today));
        // 
        // stats.setVisitCount(visitCount.intValue());
        // stats.setPageViewCount(pageViewCount.intValue());
        // 
        // repository.save(stats);
        // 
        // log.info("방문자 통계 flush 완료: {} - visit: {}, pageView: {}",
        //     today, visitCount, pageViewCount);
    }
    
    /**
     * 자정에 어제 통계를 최종 확정
     * Phase 4에서 @Scheduled 추가: @Scheduled(cron = "0 5 0 * * *")
     */
    // @Scheduled(cron = "0 5 0 * * *")  // Phase 4에서 주석 해제
    @Transactional
    public void finalizeYesterdayStats() {
        log.trace("어제 통계 최종 확정 (Phase 4: 비활성화)");
        
        // Phase 4에서 구현
    }
}
