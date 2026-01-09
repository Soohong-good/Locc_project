package com.example.locc.domain.admin.service;

import com.example.locc.domain.admin.dto.response.ContentSummaryResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 관리자 콘텐츠 통합 조회 서비스
 * - Phase 2에서 구현
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminContentQueryService {
    
    // Phase 2에서 의존성 추가:
    // private final NoticeQueryService noticeQueryService;
    // private final SermonQueryService sermonQueryService;
    // private final StaffQueryService staffQueryService;
    // private final GalleryQueryService galleryQueryService;
    // private final DepartmentQueryService departmentQueryService;
    
    /**
     * 공지사항 요약 (대시보드용)
     * Phase 2에서 구현
     */
    public ContentSummaryResponse getNoticeSummary() {
        log.info("공지사항 요약 조회 (Phase 2: 미구현)");
        throw new UnsupportedOperationException("Phase 2에서 구현 예정");
    }
    
    /**
     * 설교 요약 (대시보드용)
     * Phase 2에서 구현
     */
    public ContentSummaryResponse getSermonSummary() {
        log.info("설교 요약 조회 (Phase 2: 미구현)");
        throw new UnsupportedOperationException("Phase 2에서 구현 예정");
    }
    
    /**
     * 섬김이 요약 (대시보드용)
     * Phase 2에서 구현
     */
    public ContentSummaryResponse getStaffSummary() {
        log.info("섬김이 요약 조회 (Phase 2: 미구현)");
        throw new UnsupportedOperationException("Phase 2에서 구현 예정");
    }
    
    /**
     * 갤러리 요약 (대시보드용)
     * Phase 2에서 구현
     */
    public ContentSummaryResponse getGallerySummary() {
        log.info("갤러리 요약 조회 (Phase 2: 미구현)");
        throw new UnsupportedOperationException("Phase 2에서 구현 예정");
    }
    
    /**
     * 부서 요약 (대시보드용)
     * Phase 2에서 구현
     */
    public ContentSummaryResponse getDepartmentSummary() {
        log.info("부서 요약 조회 (Phase 2: 미구현)");
        throw new UnsupportedOperationException("Phase 2에서 구현 예정");
    }
}
