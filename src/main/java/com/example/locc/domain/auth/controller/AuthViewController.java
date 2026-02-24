package com.example.locc.domain.auth.controller;

import com.example.locc.domain.auth.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
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

    private final PasswordResetService passwordResetService;

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

    /**
     * 비밀번호 찾기 페이지
     */
    @GetMapping("/forgot-password")
    public String forgotPasswordPage() {
        log.debug("Accessing forgot password page");
        return "auth/forgot-password";
    }

    /**
     * 비밀번호 재설정 페이지
     */
    @GetMapping("/reset-password")
    public String resetPasswordPage(@RequestParam String token, Model model) {
        log.debug("Accessing reset password page with token");
        
        // 토큰 검증
        boolean isValid = passwordResetService.validateToken(token);
        
        if (!isValid) {
            model.addAttribute("error", "유효하지 않거나 만료된 링크입니다.");
            return "auth/reset-password-error";
        }
        
        model.addAttribute("token", token);
        return "auth/reset-password";
    }
}
