package com.example.locc.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Slf4j
@Controller
@RequestMapping("/auth")
public class AuthViewController {

    @GetMapping("/login")
    public String loginPage() {
        log.info("Accessing login page");
        return "auth/login";
    }

    @GetMapping("/register")
    public String registerPage() {
        log.info("Accessing register page");
        return "auth/register";
    }

    @GetMapping("/register-complete")
    public String registerCompletePage(@RequestParam String email, Model model) {
        log.info("Accessing register complete page for email: {}", email);
        model.addAttribute("email", email);
        return "auth/register-complete";
    }
}
