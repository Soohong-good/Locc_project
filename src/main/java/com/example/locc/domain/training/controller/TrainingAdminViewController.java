package com.example.locc.domain.training.controller;

import com.example.locc.domain.training.dto.response.TrainingDetailResponse;
import com.example.locc.domain.training.service.TrainingQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Training 관리자 ViewController
 * - 훈련 등록/수정 폼 제공
 */
@Slf4j
@Controller
@RequestMapping("/training/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class TrainingAdminViewController {

    private final TrainingQueryService trainingQueryService;

    /**
     * 훈련 등록 폼
     */
    @GetMapping("/create")
    public String createForm(Model model) {
        log.info("Accessing training create form");
        return "training/admin/create";
    }

    /**
     * 훈련 수정 폼
     */
    @GetMapping("/edit/{id}")
    public String editForm(@PathVariable Long id, Model model) {
        log.info("Accessing training edit form - id: {}", id);

        TrainingDetailResponse training = trainingQueryService.getDetail(id);
        model.addAttribute("training", training);

        return "training/admin/edit";
    }
}
