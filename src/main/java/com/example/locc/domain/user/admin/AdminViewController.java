package com.example.locc.controller.admin;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * 관리자 메인 페이지 컨트롤러
 */
@Slf4j
@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminViewController {

    /**
     * 관리자 메인 대시보드
     */
    @GetMapping
    public String adminMain(Model model) {
        log.debug("관리자 메인 페이지 진입");

        // 기본값 설정 (추후 통계 서비스 연동)
        model.addAttribute("pendingCount", 0);
        model.addAttribute("totalUsers", 0);
        model.addAttribute("noticeCount", 0);

        return "admin/dashboard";
    }

    /**
     * 승인 대기 회원 관리 페이지
     */
    @GetMapping("/users/pending")
    public String pendingUsers() {
        log.debug("승인 대기 회원 관리 페이지 진입");
        return "admin/user/pending";
    }

    /**
     * 전체 회원 관리 페이지
     */
    @GetMapping("/users")
    public String allUsers() {
        log.debug("전체 회원 관리 페이지 진입");
        return "admin/user/list";
    }
}