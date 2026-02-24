package com.example.locc.domain.auth.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.domain.auth.dto.request.EmailVerificationRequest;
import com.example.locc.domain.auth.dto.request.VerifyCodeRequest;
import com.example.locc.domain.auth.service.EmailVerificationService;
import com.example.locc.exception.InvalidInputException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 이메일 인증 API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/auth/email")
@RequiredArgsConstructor
public class EmailVerificationApiController {

    private final EmailVerificationService emailVerificationService;

    /**
     * 이메일 인증 코드 발송
     * 쿨다운 중이면 Service에서 IllegalStateException 발생 → RestExceptionHandler(400) 처리
     */
    @PostMapping("/send-code")
    public ResponseEntity<ApiResponse<Void>> sendVerificationCode(
            @Valid @RequestBody EmailVerificationRequest request) {

        emailVerificationService.sendVerificationCode(request.getEmail());
        return ResponseEntity.ok(ApiResponse.ok(null, "인증 코드가 발송되었습니다. 이메일을 확인해주세요."));
    }

    /**
     * 인증 코드 검증
     */
    @PostMapping("/verify-code")
    public ResponseEntity<ApiResponse<Void>> verifyCode(
            @Valid @RequestBody VerifyCodeRequest request) {

        boolean isValid = emailVerificationService.verifyCode(request.getEmail(), request.getCode());
        if (!isValid) {
            throw new InvalidInputException("인증 코드가 일치하지 않거나 만료되었습니다.");
        }
        return ResponseEntity.ok(ApiResponse.ok(null, "이메일 인증이 완료되었습니다."));
    }

    /**
     * 남은 쿨다운 시간 조회 (초)
     */
    @GetMapping("/cooldown")
    public ResponseEntity<ApiResponse<Long>> getRemainingCooldown(@RequestParam String email) {
        long remainingSeconds = emailVerificationService.getRemainingCooldown(email);
        return ResponseEntity.ok(ApiResponse.ok(remainingSeconds));
    }
}
