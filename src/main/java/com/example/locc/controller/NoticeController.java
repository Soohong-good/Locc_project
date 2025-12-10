package com.example.locc.controller;

import com.example.locc.dto.NoticeDto;
import com.example.locc.entity.User;
import com.example.locc.service.NoticeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Slf4j
@Controller
@RequestMapping("/church/notice")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    @GetMapping
    public String noticeList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            Authentication authentication,
            Model model) {

        log.info("Accessing notice list - page: {}, size: {}, keyword: {}", page, size, keyword);

        // 관리자 권한 체크
        boolean isAdmin = false;
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof User) {
                User user = (User) principal;
                isAdmin = user.getRole() == User.Role.ADMIN;
            }
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<NoticeDto> notices;

        if (keyword != null && !keyword.trim().isEmpty()) {
            notices = noticeService.search(keyword, pageable);
            model.addAttribute("keyword", keyword);
        } else {
            notices = noticeService.findAll(pageable);
        }

        model.addAttribute("notices", notices);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", notices.getTotalPages());
        model.addAttribute("totalItems", notices.getTotalElements());
        model.addAttribute("isAdmin", isAdmin);

        return "church/notice/list";
    }

    @GetMapping("/{id}")
    public String noticeDetail(
            @PathVariable Long id,
            Authentication authentication,
            Model model) {
        
        log.info("Accessing notice detail - id: {}", id);

        // 관리자 권한 체크
        boolean isAdmin = false;
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof User) {
                User user = (User) principal;
                isAdmin = user.getRole() == User.Role.ADMIN;
            }
        }

        // 조회수 증가
        noticeService.increaseViews(id);

        NoticeDto notice = noticeService.findById(id);
        model.addAttribute("notice", notice);
        model.addAttribute("isAdmin", isAdmin);

        return "church/notice/detail";
    }
}