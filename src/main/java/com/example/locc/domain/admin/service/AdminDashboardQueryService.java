package com.example.locc.domain.admin.service;

import com.example.locc.domain.admin.dto.response.ContentSummaryResponse;
import com.example.locc.domain.admin.dto.response.DashboardResponse;
import com.example.locc.domain.gallery.service.GalleryImageQueryService;
import com.example.locc.domain.helprequest.service.HelpRequestQueryService;
import com.example.locc.domain.user.service.UserQueryService;
import com.example.locc.common.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 관리자 대시보드 조회 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardQueryService {

    private final AdminStatisticsQueryService statisticsQueryService;
    private final AdminContentQueryService contentQueryService;
    private final UserQueryService userQueryService;
    private final HelpRequestQueryService helpRequestQueryService;
    private final GalleryImageQueryService galleryImageQueryService;

    public DashboardResponse getDashboard() {
        log.info("관리자 대시보드 조회");

        List<ContentSummaryResponse> contentSummaries = List.of(
                contentQueryService.getNoticeSummary(),
                contentQueryService.getSermonSummary(),
                contentQueryService.getStaffSummary(),
                contentQueryService.getGallerySummary(),
                contentQueryService.getDepartmentSummary()
        );

        return DashboardResponse.builder()
                .visitorStatistics(statisticsQueryService.getVisitorStatistics())
                .contentSummaries(contentSummaries)
                .totalUsers(userQueryService.countAllUsers())
                .approvedUsers(userQueryService.countApprovedUsers())
                .pendingUsers(userQueryService.countPendingUsers())
                .totalHelpRequests(helpRequestQueryService.countAll())
                .pendingHelpRequests(helpRequestQueryService.countPending())
                .inProgressHelpRequests(helpRequestQueryService.countInProgress())
                .generatedAt(java.time.LocalDateTime.now())
                .build();
    }

    /**
     * 대시보드 최신 갤러리 목록 조회
     */
    public PageResponse<GalleryImageQueryService.GalleryDashboardResponse> getRecentGallery(int page, int size) {
        return PageResponse.from(galleryImageQueryService.getLatestGalleryForDashboard(page, size));
    }
}
