package com.example.locc.domain.social.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * 소셜 로그인/회원가입 View Controller
 */
@Slf4j
@Controller
@RequestMapping("/social")
@RequiredArgsConstructor
public class SocialViewController {

    /**
     * 소셜 회원가입 페이지 (통합)
     */
    @GetMapping("/register")
    public String registerPage(@RequestParam String tempToken, Model model) {
        log.debug("Accessing social register page with tempToken");
        model.addAttribute("tempToken", tempToken);
        return "social/register";
    }

    /**
     * 소셜 회원가입 승인 대기 페이지
     */
    @GetMapping("/pending")
    public String pendingPage(@RequestParam(required = false) String email, Model model) {
        log.debug("Accessing social pending page - email: {}", email);
        model.addAttribute("email", email);
        return "social/pending";
    }
}
