package com.example.locc.domain.admin.service;

import com.example.locc.domain.admin.dto.response.VisitorStatisticsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 관리자 통계 전문 조회 서비스
 * - Phase 4에서 구현
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminStatisticsQueryService {
    
    // Phase 4에서 의존성 추가:
    // private final VisitorCounterService counterService;
    // private final VisitorStatisticsRepository repository;
    
    /**
     * 방문자 통계 조회
     * Phase 4에서 구현
     */
    public VisitorStatisticsResponse getVisitorStatistics() {
        log.info("방문자 통계 조회 (Phase 4: 미구현)");
        throw new UnsupportedOperationException("Phase 4에서 구현 예정");
    }
}
