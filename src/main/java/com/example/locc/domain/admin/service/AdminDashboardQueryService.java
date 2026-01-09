package com.example.locc.domain.admin.service;

import com.example.locc.domain.admin.dto.response.DashboardResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 관리자 대시보드 조회 서비스
 * - Phase 3에서 실제 데이터 연동
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardQueryService {
    
    // Phase 3에서 의존성 추가:
    // private final AdminStatisticsQueryService statisticsQueryService;
    // private final AdminContentQueryService contentQueryService;
    
    /**
     * 대시보드 데이터 조회
     * Phase 3에서 구현
     */
    public DashboardResponse getDashboard() {
        log.info("대시보드 조회 (Phase 1: 미구현)");
        
        // Phase 3에서 실제 데이터 반환
        throw new UnsupportedOperationException("Phase 3에서 구현 예정");
    }
}
