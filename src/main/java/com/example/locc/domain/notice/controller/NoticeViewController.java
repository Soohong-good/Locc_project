package com.example.locc.domain.notice.controller;

import com.example.locc.domain.notice.dto.request.NoticeSearchCondition;
import com.example.locc.domain.notice.dto.response.NoticeDetailResponse;
import com.example.locc.domain.notice.dto.response.NoticeResponse;
import com.example.locc.domain.notice.service.NoticeCommandService;
import com.example.locc.domain.notice.service.NoticeQueryService;
import com.example.locc.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Notice ViewController
 * - Thymeleaf 템플릿 반환
 * - QueryService만 사용 (조회만)
 */
@Slf4j
@Controller
@RequestMapping("/church/notice")
@RequiredArgsConstructor
public class NoticeViewController {

    private final NoticeQueryService noticeQueryService;
    private final NoticeCommandService noticeCommandService;

    @GetMapping
    public String noticeList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            Authentication authentication,
            Model model) {

        log.info("Accessing notice list - page: {}, size: {}, keyword: {}", page, size, keyword);

        // 관리자 권한 체크
        boolean isAdmin = isAdmin(authentication);

        // SearchCondition 생성
        NoticeSearchCondition condition = NoticeSearchCondition.builder()
                .keyword(keyword)
                .page(page)
                .size(size)
                .build();

        // 목록 조회
        Page<NoticeResponse> notices = noticeQueryService.findList(condition);

        model.addAttribute("notices", notices);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", notices.getTotalPages());
        model.addAttribute("totalItems", notices.getTotalElements());
        model.addAttribute("isAdmin", isAdmin);
        model.addAttribute("keyword", keyword);

        return "church/notice/list";
    }

    @GetMapping("/{id}")
    public String noticeDetail(
            @PathVariable Long id,
            Authentication authentication,
            Model model) {
        
        log.info("Accessing notice detail - id: {}", id);

        // 관리자 권한 체크
        boolean isAdmin = isAdmin(authentication);

        // 조회수 증가
        noticeCommandService.increaseViews(id);

        // 상세 조회
        NoticeDetailResponse notice = noticeQueryService.findDetail(id);
        
        model.addAttribute("notice", notice);
        model.addAttribute("isAdmin", isAdmin);

        return "church/notice/detail";
    }

    /**
     * 관리자 권한 확인
     */
    private boolean isAdmin(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            User user = (User) principal;
            return user.isAdmin();
        }

        return false;
    }
}