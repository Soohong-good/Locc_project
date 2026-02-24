package com.example.locc.domain.admin.controller;

import com.example.locc.domain.admin.service.AdminContentQueryService;
import com.example.locc.domain.admin.service.AdminStatisticsQueryService;
import com.example.locc.domain.helprequest.service.HelpRequestQueryService;
import com.example.locc.domain.notice.service.NoticeQueryService;
import com.example.locc.domain.sermon.service.SermonQueryService;
import com.example.locc.domain.user.service.UserQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * 관리자 View Controller
 * - 모든 관리자 화면 반환 (서버 렌더링)
 * - Phase 1: 더미 대시보드
 * - Phase 2: 콘텐츠 통합 조회 및 대시보드 통합 관리
 * - Phase 3: 실제 대시보드 데이터 연동
 */
@Slf4j
@Controller
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminViewController {

    private final UserQueryService userQueryService;
    private final NoticeQueryService noticeQueryService;
    private final SermonQueryService sermonQueryService;
    private final AdminContentQueryService adminContentQueryService;
    private final AdminStatisticsQueryService adminStatisticsQueryService;
    private final HelpRequestQueryService helpRequestQueryService;

    /**
     * 관리자 대시보드 (통합 관리)
     * Phase 2: 콘텐츠 통계 + 최근 목록
     * Phase 3: 회원 통계 추가
     * Phase 4: 방문자 통계 추가
     * Phase 5: 도움요청 통계 추가
     */
    @GetMapping
    public String dashboard(Model model) {
        log.info("관리자 대시보드 접근");

        model.addAttribute("message", "Admin 영역 구축 완료 (Phase 5)");
        model.addAttribute("phase", "Phase 5: 도움요청 통계");
        model.addAttribute("nextPhase", "완료!");
        
        // Phase 2: 콘텐츠 요약 통계
        model.addAttribute("noticeSummary", adminContentQueryService.getNoticeSummary());
        model.addAttribute("sermonSummary", adminContentQueryService.getSermonSummary());
        
        // Phase 2: 공지사항/설교 목록 (각 10개, 페이징)
        model.addAttribute("recentNotices", noticeQueryService.findLatestUnpinned(10));
        model.addAttribute("recentSermons", sermonQueryService.findLatest(10));
        
        // Phase 3: 회원 통계
        model.addAttribute("totalUsers", userQueryService.countAllUsers());
        model.addAttribute("approvedUsers", userQueryService.countApprovedUsers());
        model.addAttribute("pendingUsers", userQueryService.countPendingUsers());
        model.addAttribute("rejectedUsers", userQueryService.countRejectedUsers());
        
        // Phase 4: 방문자 통계
        model.addAttribute("visitorStats", adminStatisticsQueryService.getVisitorStatistics());
        
        // Phase 5: 도움요청 통계
        model.addAttribute("totalHelpRequests", helpRequestQueryService.countAll());
        model.addAttribute("pendingHelpRequests", helpRequestQueryService.countPending());
        model.addAttribute("inProgressHelpRequests", helpRequestQueryService.countInProgress());

        return "admin/dashboard";
    }

    /**
     * 승인 대기 회원 관리 페이지
     */
    @GetMapping("/users/pending")
    public String pendingUsers(Model model) {
        log.debug("승인 대기 회원 관리 페이지 진입");

        // 초기 데이터 로드 (JavaScript에서 API로 추가 로드)
        model.addAttribute("users", userQueryService.getPendingUsers(PageRequest.of(0, 20)));

        return "admin/user/pending";
    }

    /**
     * 전체 회원 관리 페이지
     */
    @GetMapping("/users")
    public String allUsers(Model model) {
        log.debug("전체 회원 관리 페이지 진입");

        // 초기 데이터 로드 (JavaScript에서 API로 추가 로드)
        model.addAttribute("users", userQueryService.getAllUsers(PageRequest.of(0, 20)));

        // 통계 데이터 (임시로 0 설정, 추후 개선)
        model.addAttribute("approvedCount", 0);  // TODO: 승인 완료 회원 수 조회
        model.addAttribute("pendingCount", 0);   // TODO: 승인 대기 회원 수 조회
        model.addAttribute("rejectedCount", 0);  // TODO: 반려 회원 수 조회

        return "admin/user/list";
    }

    /**
     * 도움요청 관리 페이지
     */
    @GetMapping("/help-requests")
    public String helpRequests(Model model) {
        log.debug("도움요청 관리 페이지 진입");

        // 통계 데이터
        model.addAttribute("totalCount", helpRequestQueryService.countAll());
        model.addAttribute("pendingCount", helpRequestQueryService.countPending());
        model.addAttribute("inProgressCount", helpRequestQueryService.countInProgress());

        return "admin/help-request/list";
    }

    /**
     * 부서 YouTube 관리 페이지
     */
    @GetMapping("/department/youtube")
    public String departmentYouTube() {
        log.debug("부서 YouTube 관리 페이지 진입");
        return "admin/department-youtube";
    }

    /**
     * 예배 YouTube 관리 페이지
     */
    @GetMapping("/worship/youtube")
    public String worshipYouTube() {
        log.debug("예배 YouTube 관리 페이지 진입");
        return "admin/worship-youtube";
    }
}

