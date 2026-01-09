package com.example.locc.domain.admin.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

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

    /**
     * 관리자 대시보드
     * Phase 1: 더미 페이지
     */
    @GetMapping
    public String dashboard(Model model) {
        log.info("관리자 대시보드 접근");
        
        model.addAttribute("message", "Admin 영역 구축 완료 (Phase 1)");
        model.addAttribute("phase", "Phase 1: 기반 구축");
        model.addAttribute("nextPhase", "Phase 2: 콘텐츠 통합 조회");
        
        return "admin/dashboard";
    }
}
