package com.example.locc.domain.sermon.controller;

import com.example.locc.domain.sermon.dto.request.SermonSearchCondition;
import com.example.locc.domain.sermon.dto.response.SermonDetailResponse;
import com.example.locc.domain.sermon.dto.response.SermonResponse;
import com.example.locc.domain.sermon.service.SermonQueryService;
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

import java.util.List;

/**
 * Sermon ViewController
 * - Thymeleaf 템플릿 반환
 * - QueryService만 사용 (조회만)
 */
@Slf4j
@Controller
@RequestMapping("/worship/sermon")
@RequiredArgsConstructor
public class SermonController {

    private final SermonQueryService sermonQueryService;

    @GetMapping
    public String sermonList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            Authentication authentication,
            Model model) {

        log.info("Accessing sermon list - page: {}, size: {}, keyword: {}, category: {}",
                page, size, keyword, category);

        // 관리자 권한 체크
        boolean isAdmin = isAdmin(authentication);

        // SearchCondition 생성
        SermonSearchCondition condition = SermonSearchCondition.builder()
                .keyword(keyword)
                .category(category)
                .page(page)
                .size(size)
                .sortBy("sermonDate")
                .build();

        // 목록 조회
        Page<SermonResponse> sermons = sermonQueryService.findList(condition);

        // 최신 설교 가져오기 (영상이 있는 경우)
        List<SermonResponse> latestSermons = sermonQueryService.findLatest(1);
        SermonResponse latestSermon = null;
        if (!latestSermons.isEmpty()) {
            SermonResponse sermon = latestSermons.get(0);
            // 상세 정보에서 videoUrl 확인 필요시
            latestSermon = sermon;
        }

        model.addAttribute("sermons", sermons);
        model.addAttribute("latestSermon", latestSermon);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", sermons.getTotalPages());
        model.addAttribute("totalItems", sermons.getTotalElements());
        model.addAttribute("isAdmin", isAdmin);
        model.addAttribute("keyword", keyword);
        model.addAttribute("category", category);

        return "worship/sermon/list";
    }

    @GetMapping("/{id}")
    public String sermonDetail(
            @PathVariable Long id,
            Authentication authentication,
            Model model) {
        
        log.info("Accessing sermon detail - id: {}", id);

        // 관리자 권한 체크
        boolean isAdmin = isAdmin(authentication);

        // 상세 조회
        SermonDetailResponse sermon = sermonQueryService.findDetail(id);
        
        model.addAttribute("sermon", sermon);
        model.addAttribute("isAdmin", isAdmin);

        return "worship/sermon/detail";
    }

    @GetMapping("/latest")
    public String latestSermon(
            Authentication authentication,
            Model model) {
        
        log.info("Accessing latest sermon");

        // 관리자 권한 체크
        boolean isAdmin = isAdmin(authentication);

        // 최신 설교 조회
        List<SermonResponse> latestSermons = sermonQueryService.findLatest(1);
        
        if (latestSermons.isEmpty()) {
            return "redirect:/worship/sermon";
        }

        // 최신 설교의 상세 정보
        SermonDetailResponse sermon = sermonQueryService.findDetail(latestSermons.get(0).getId());
        
        model.addAttribute("sermon", sermon);
        model.addAttribute("isAdmin", isAdmin);

        return "worship/sermon/detail";
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
