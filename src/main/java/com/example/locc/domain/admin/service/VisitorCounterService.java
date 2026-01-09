package com.example.locc.domain.admin.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

/**
 * 방문자 카운터 서비스
 * - Phase 4에서 구현
 * - Redis 기반 실시간 카운팅
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VisitorCounterService {
    
    // Phase 4에서 의존성 추가:
    // private final StringRedisTemplate redisTemplate;
    
    /**
     * 페이지뷰 증가
     * Phase 4에서 구현
     */
    public void incrementPageView() {
        log.debug("페이지뷰 증가 (Phase 4: 미구현)");
        // Phase 4: Redis INCR 구현
    }
    
    /**
     * 방문 증가
     * Phase 4에서 구현
     */
    public void incrementVisit() {
        log.debug("방문 증가 (Phase 4: 미구현)");
        // Phase 4: Redis INCR 구현
    }
    
    /**
     * 특정 날짜의 카운트 조회
     * Phase 4에서 구현
     */
    public Long getPageViewCount(LocalDate date) {
        log.debug("페이지뷰 조회: {} (Phase 4: 미구현)", date);
        return 0L;
    }
    
    public Long getVisitCount(LocalDate date) {
        log.debug("방문 조회: {} (Phase 4: 미구현)", date);
        return 0L;
    }
    
    /**
     * 오늘 카운트 조회
     */
    public Long getTodayPageViewCount() {
        return getPageViewCount(LocalDate.now());
    }
    
    public Long getTodayVisitCount() {
        return getVisitCount(LocalDate.now());
    }
}
