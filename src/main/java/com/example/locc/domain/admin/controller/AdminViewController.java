package com.example.locc.domain.admin.controller;

import com.example.locc.domain.admin.service.AdminContentQueryService;
import com.example.locc.domain.notice.dto.request.NoticeSearchCondition;
import com.example.locc.domain.notice.service.NoticeQueryService;
import com.example.locc.domain.sermon.dto.request.SermonSearchCondition;
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
import org.springframework.web.bind.annotation.RequestParam;

/**
 * 관리자 View Controller
 * - 모든 관리자 화면 반환 (서버 렌더링)
 * - Phase 1: 더미 대시보드
 * - Phase 2: 콘텐츠 목록 페이지
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

    /**
     * 관리자 대시보드
     * Phase 1: 더미 페이지
     */
    @GetMapping
    public String dashboard(Model model) {
        log.info("관리자 대시보드 접근");

        model.addAttribute("message", "Admin 영역 구축 완료 (Phase 2)");
        model.addAttribute("phase", "Phase 2: 콘텐츠 통합 조회");
        model.addAttribute("nextPhase", "Phase 3: 실제 대시보드 데이터");
        
        // Phase 2: 콘텐츠 요약 통계
        model.addAttribute("noticeSummary", adminContentQueryService.getNoticeSummary());
        model.addAttribute("sermonSummary", adminContentQueryService.getSermonSummary());

        return "admin/dashboard";
    }

    /**
     * 공지사항 관리 목록
     * Phase 2
     */
    @GetMapping("/notices")
    public String noticeList(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Model model) {
        
        log.debug("공지사항 관리 목록 진입: keyword={}, page={}", keyword, page);
        
        NoticeSearchCondition condition = NoticeSearchCondition.builder()
                .keyword(keyword)
                .page(page)
                .size(size)
                .build();
        
        model.addAttribute("notices", noticeQueryService.findList(condition));
        model.addAttribute("keyword", keyword);
        
        return "admin/contents/notice-list";
    }

    /**
     * 설교 관리 목록
     * Phase 2
     */
    @GetMapping("/sermons")
    public String sermonList(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Model model) {
        
        log.debug("설교 관리 목록 진입: category={}, keyword={}, page={}", category, keyword, page);
        
        SermonSearchCondition condition = SermonSearchCondition.builder()
                .category(category)
                .keyword(keyword)
                .page(page)
                .size(size)
                .build();
        
        model.addAttribute("sermons", sermonQueryService.findList(condition));
        model.addAttribute("category", category);
        model.addAttribute("keyword", keyword);
        
        return "admin/contents/sermon-list";
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
     * 부서 YouTube 관리 페이지
     */
    @GetMapping("/department/youtube")
    public String departmentYouTube() {
        log.debug("부서 YouTube 관리 페이지 진입");
        return "admin/department-youtube";
    }
}

