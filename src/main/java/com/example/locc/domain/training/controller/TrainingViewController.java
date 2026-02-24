package com.example.locc.domain.training.controller;

import com.example.locc.domain.training.dto.response.TrainingDetailResponse;
import com.example.locc.domain.training.dto.response.TrainingResponse;
import com.example.locc.domain.training.service.TrainingQueryService;
import com.example.locc.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

/**
 * Training ViewController
 * - Thymeleaf 템플릿 반환
 * - QueryService만 사용 (조회만)
 */
@Slf4j
@Controller
@RequestMapping("/training")
@RequiredArgsConstructor
public class TrainingViewController {

    private final TrainingQueryService trainingQueryService;

    /**
     * 훈련 소개 페이지 (/worship/training-intro)
     */
    @GetMapping("/intro")
    public String intro(Model model) {
        log.info("Accessing training intro page");
        return "worship/training-intro";
    }

    /**
     * 훈련 목록 페이지 (/training)
     */
    @GetMapping
    public String list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword,
            Authentication authentication,
            Model model) {

        log.info("Accessing training list - page: {}, size: {}, keyword: {}", page, size, keyword);

        boolean isAdmin = isAdmin(authentication);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<TrainingResponse> trainings;
        if (keyword != null && !keyword.isBlank()) {
            trainings = trainingQueryService.search(keyword, pageable);
        } else {
            trainings = trainingQueryService.getList(pageable);
        }

        // 신청 가능한 훈련 목록
        List<TrainingResponse> openTrainings = trainingQueryService.getOpenTrainings();

        model.addAttribute("trainings", trainings);
        model.addAttribute("openTrainings", openTrainings);
        model.addAttribute("keyword", keyword);
        model.addAttribute("isAdmin", isAdmin);

        return "training/list";
    }

    /**
     * 훈련 상세 페이지
     */
    @GetMapping("/{id}")
    public String detail(
            @PathVariable Long id,
            Authentication authentication,
            Model model) {

        log.info("Accessing training detail - id: {}", id);

        TrainingDetailResponse training = trainingQueryService.getDetail(id);
        boolean isAdmin = isAdmin(authentication);
        boolean isLoggedIn = authentication != null && authentication.isAuthenticated();

        model.addAttribute("training", training);
        model.addAttribute("isAdmin", isAdmin);
        model.addAttribute("isLoggedIn", isLoggedIn);

        return "training/detail";
    }

    /**
     * 관리자 권한 확인
     */
    private boolean isAdmin(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            return user.isAdmin();
        }

        return false;
    }
}
