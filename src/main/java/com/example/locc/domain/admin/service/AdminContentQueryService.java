package com.example.locc.domain.admin.service;

import com.example.locc.domain.admin.dto.internal.ContentSummaryItem;
import com.example.locc.domain.admin.dto.response.ContentSummaryResponse;
import com.example.locc.domain.notice.service.NoticeQueryService;
import com.example.locc.domain.sermon.service.SermonQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

/**
 * 관리자 콘텐츠 통합 조회 서비스
 * - Phase 2 구현 완료
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminContentQueryService {
    
    private final NoticeQueryService noticeQueryService;
    private final SermonQueryService sermonQueryService;
    
    /**
     * 공지사항 요약 (대시보드용)
     */
    public ContentSummaryResponse getNoticeSummary() {
        log.debug("공지사항 요약 조회");
        
        Long totalCount = noticeQueryService.countAll();
        Long recentCount = noticeQueryService.countRecent(7);
        
        // TODO Phase 3: 최근 5개 목록 조회 추가
        
        return ContentSummaryResponse.of(
                "NOTICE",
                "공지사항",
                totalCount,
                recentCount,
                Collections.emptyList(),  // Phase 3에서 구현
                "/admin/notices"
        );
    }
    
    /**
     * 설교 요약 (대시보드용)
     */
    public ContentSummaryResponse getSermonSummary() {
        log.debug("설교 요약 조회");
        
        Long totalCount = sermonQueryService.countAll();
        Long recentCount = sermonQueryService.countRecent(7);
        
        // TODO Phase 3: 최근 5개 목록 조회 추가
        
        return ContentSummaryResponse.of(
                "SERMON",
                "설교",
                totalCount,
                recentCount,
                Collections.emptyList(),  // Phase 3에서 구현
                "/admin/sermons"
        );
    }
    
    /**
     * 섬김이 요약 (대시보드용)
     * Phase 3에서 구현
     */
    public ContentSummaryResponse getStaffSummary() {
        log.debug("섬김이 요약 조회 (Phase 3: 미구현)");
        
        return ContentSummaryResponse.of(
                "STAFF",
                "섬김이",
                0L,
                0L,
                Collections.emptyList(),
                "/admin/staff"
        );
    }
    
    /**
     * 갤러리 요약 (대시보드용)
     * Phase 3에서 구현
     */
    public ContentSummaryResponse getGallerySummary() {
        log.debug("갤러리 요약 조회 (Phase 3: 미구현)");
        
        return ContentSummaryResponse.of(
                "GALLERY",
                "갤러리",
                0L,
                0L,
                Collections.emptyList(),
                "/admin/galleries"
        );
    }
    
    /**
     * 부서 요약 (대시보드용)
     * Phase 3에서 구현
     */
    public ContentSummaryResponse getDepartmentSummary() {
        log.debug("부서 요약 조회 (Phase 3: 미구현)");
        
        return ContentSummaryResponse.of(
                "DEPARTMENT",
                "부서",
                0L,
                0L,
                Collections.emptyList(),
                "/admin/departments"
        );
    }
}
