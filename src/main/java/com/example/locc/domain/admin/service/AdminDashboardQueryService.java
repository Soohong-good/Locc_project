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
                .memberGrowthRate(calcMemberGrowthRate())
                .totalHelpRequests(helpRequestQueryService.countAll())
                .pendingHelpRequests(helpRequestQueryService.countPending())
                .inProgressHelpRequests(helpRequestQueryService.countInProgress())
                .generatedAt(java.time.LocalDateTime.now())
                .build();
    }

    /**
     * 전월 대비 신규 가입자 증감률(%) 계산
     * - 이번 달 가입자와 지난달 가입자를 비교
     * - 지난달 0명이면 이번 달 가입자 유무로 0% / 100% 처리
     */
    private Double calcMemberGrowthRate() {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime thisMonthStart = now.toLocalDate().withDayOfMonth(1).atStartOfDay();
        java.time.LocalDateTime lastMonthStart = thisMonthStart.minusMonths(1);

        long thisMonth = userQueryService.countUsersCreatedBetween(thisMonthStart, now);
        long lastMonth = userQueryService.countUsersCreatedBetween(lastMonthStart, thisMonthStart);

        if (lastMonth == 0) {
            return thisMonth > 0 ? 100.0 : 0.0;
        }
        double rate = ((double) (thisMonth - lastMonth) / lastMonth) * 100.0;
        return Math.round(rate * 10.0) / 10.0; // 소수 첫째자리
    }

    /**
     * 대시보드 최신 갤러리 목록 조회
     */
    public PageResponse<GalleryImageQueryService.GalleryDashboardResponse> getRecentGallery(int page, int size) {
        return PageResponse.from(galleryImageQueryService.getLatestGalleryForDashboard(page, size));
    }
}
