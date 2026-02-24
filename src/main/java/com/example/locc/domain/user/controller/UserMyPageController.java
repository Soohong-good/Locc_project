package com.example.locc.domain.user.controller;

import com.example.locc.domain.user.dto.response.UserMyPageResponse;
import com.example.locc.domain.user.service.UserMyPageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.security.Principal;

/**
 * 마이페이지 ViewController
 */
@Slf4j
@Controller
@RequestMapping("/mypage")
@RequiredArgsConstructor
public class UserMyPageController {

    private final UserMyPageService myPageService;

    /**
     * 마이페이지 메인 (탭 구조)
     */
    @GetMapping
    public String mypage(Principal principal, Model model) {
        if (principal == null) {
            return "redirect:/auth/login";
        }

        UserMyPageResponse userInfo = myPageService.getMyInfo(principal.getName());
        model.addAttribute("user", userInfo);
        
        return "user/mypage";
    }
}
