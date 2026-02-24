package com.example.locc.domain.training.controller;

import com.example.locc.domain.training.dto.response.ApplicationResponse;
import com.example.locc.domain.training.dto.response.TrainingDetailResponse;
import com.example.locc.domain.training.service.ApplicationQueryService;
import com.example.locc.domain.training.service.TrainingQueryService;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.exception.NotFoundException;
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
 * Application ViewController
 */
@Slf4j
@Controller
@RequestMapping("/training/application")
@RequiredArgsConstructor
public class ApplicationViewController {

    private final ApplicationQueryService applicationQueryService;
    private final TrainingQueryService trainingQueryService;
    private final UserRepository userRepository;

    /**
     * 훈련 신청 페이지
     */
    @GetMapping("/apply/{trainingId}")
    public String applyForm(
            @PathVariable Long trainingId,
            Model model) {

        log.info("Accessing training apply form - trainingId: {}", trainingId);

        TrainingDetailResponse training = trainingQueryService.getDetail(trainingId);
        model.addAttribute("training", training);

        return "training/apply";
    }

    /**
     * 내 신청 내역
     */
    @GetMapping("/my")
    public String myApplications(
            Authentication authentication,
            Model model) {

        String email = authentication.getName();
        log.info("Accessing my applications - email: {}", email);

        // email로 User 조회
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다: " + email));

        List<ApplicationResponse> applications = applicationQueryService.getMyApplications(user.getId());
        model.addAttribute("applications", applications);

        return "training/my-applications";
    }

    /**
     * 신청자 관리 (관리자용)
     */
    @GetMapping("/manage/{trainingId}")
    public String manageApplications(
            @PathVariable Long trainingId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Model model) {

        log.info("Accessing application management - trainingId: {}", trainingId);

        TrainingDetailResponse training = trainingQueryService.getDetail(trainingId);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appliedAt"));

        Page<ApplicationResponse> applications = applicationQueryService.getListByTraining(trainingId, pageable);
        long totalCount = applicationQueryService.countByTraining(trainingId);

        model.addAttribute("training", training);
        model.addAttribute("applications", applications);
        model.addAttribute("totalCount", totalCount);

        return "training/applications-list";
    }
}
