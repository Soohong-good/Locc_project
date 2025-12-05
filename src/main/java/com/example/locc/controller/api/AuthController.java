package com.example.locc.controller.api;

import com.example.locc.dto.auth.*;
import com.example.locc.entity.User;
import com.example.locc.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 회원가입
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Register request for email: {}", request.getEmail());
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    /**
     * 로그인
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login request for email: {}", request.getEmail());
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * 토큰 갱신
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("Refresh token request");
        AuthResponse response = authService.refresh(request);
        return ResponseEntity.ok(response);
    }

    /**
     * 로그아웃
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName();
            log.info("Logout request for email: {}", email);
            authService.logout(email);
        }
        return ResponseEntity.ok().build();
    }

    /**
     * 현재 로그인한 사용자 정보
     */
    @GetMapping("/me")
    public ResponseEntity<UserInfoResponse> getMe(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        User user = (User) authentication.getPrincipal();
        UserInfoResponse response = UserInfoResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .gender(user.getGender())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole().name())
                .userType(user.getUserType().name())
                .address(user.getAddress())
                .birth(user.getBirth())
                .registrationPath(user.getRegistrationPath())
                .build();

        return ResponseEntity.ok(response);
    }
}