package com.example.locc.domain.bulletin.controller;

import com.example.locc.domain.bulletin.dto.response.BulletinDetailResponse;
import com.example.locc.domain.bulletin.dto.response.BulletinResponse;
import com.example.locc.domain.bulletin.service.BulletinQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Bulletin ViewController
 * - 화면 반환 전용
 * - QueryService만 사용
 */
@Slf4j
@Controller
@RequestMapping("/church/bulletin")
@RequiredArgsConstructor
public class BulletinViewController {

    private final BulletinQueryService bulletinQueryService;

    /**
     * 주보 목록 페이지
     */
    @GetMapping
    public String list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            Model model) {

        Pageable pageable = PageRequest.of(page, size);
        Page<BulletinResponse> bulletins;

        if (keyword != null && !keyword.isBlank()) {
            bulletins = bulletinQueryService.searchBulletins(keyword, pageable);
            model.addAttribute("keyword", keyword);
        } else {
            bulletins = bulletinQueryService.getBulletins(pageable);
        }

        model.addAttribute("bulletins", bulletins);
        return "church/bulletin/list";
    }

    /**
     * 주보 상세 페이지
     */
    @GetMapping("/{id}")
    public String detail(@PathVariable Long id, Model model) {
        BulletinDetailResponse bulletin = bulletinQueryService.getBulletinDetail(id);
        model.addAttribute("bulletin", bulletin);
        return "church/bulletin/detail";
    }
}
