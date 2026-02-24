package com.example.locc.domain.auth.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.domain.auth.dto.request.NewPasswordRequest;
import com.example.locc.domain.auth.dto.request.PasswordResetRequest;
import com.example.locc.domain.auth.service.PasswordResetService;
import com.example.locc.exception.InvalidInputException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 비밀번호 재설정 API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/auth/password")
@RequiredArgsConstructor
public class PasswordResetApiController {

    private final PasswordResetService passwordResetService;

    /**
     * 비밀번호 재설정 이메일 발송
     * IllegalArgumentException/IllegalStateException → RestExceptionHandler(400) 처리
     */
    @PostMapping("/reset-request")
    public ResponseEntity<ApiResponse<Void>> requestPasswordReset(
            @Valid @RequestBody PasswordResetRequest request) {

        passwordResetService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok(ApiResponse.ok(null, "비밀번호 재설정 링크가 이메일로 발송되었습니다."));
    }

    /**
     * 토큰 검증
     */
    @GetMapping("/validate-token")
    public ResponseEntity<ApiResponse<Void>> validateToken(@RequestParam String token) {
        boolean isValid = passwordResetService.validateToken(token);
        if (!isValid) {
            throw new InvalidInputException("유효하지 않거나 만료된 토큰입니다.");
        }
        return ResponseEntity.ok(ApiResponse.ok(null, "유효한 토큰입니다."));
    }

    /**
     * 비밀번호 재설정
     */
    @PostMapping("/reset")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody NewPasswordRequest request) {

        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.ok(null, "비밀번호가 성공적으로 변경되었습니다."));
    }
}
