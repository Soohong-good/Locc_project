package com.example.locc.domain.user.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * 인증 관련 View Controller
 * - 로그인/회원가입 페이지 반환
 */
@Slf4j
@Controller
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthViewController {

    /**
     * 로그인 페이지
     */
    @GetMapping("/login")
    public String loginPage() {
        log.debug("Accessing login page");
        return "auth/login";
    }

    /**
     * 회원가입 페이지
     */
    @GetMapping("/register")
    public String registerPage() {
        log.debug("Accessing register page");
        return "auth/register";
    }

    /**
     * 회원가입 완료 페이지
     */
    @GetMapping("/register-complete")
    public String registerCompletePage(@RequestParam(required = false) String email) {
        log.debug("Accessing register complete page - email: {}", email);
        return "auth/register-complete";
    }
}
