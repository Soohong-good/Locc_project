package com.example.locc.domain.auth.controller;

import com.example.locc.domain.auth.dto.request.NewPasswordRequest;
import com.example.locc.domain.auth.dto.request.PasswordResetRequest;
import com.example.locc.domain.auth.dto.response.EmailVerificationResponse;
import com.example.locc.domain.auth.service.PasswordResetService;
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
     * 비밀번호 재설정 요청
     * 이메일로 재설정 링크 발송
     */
    @PostMapping("/reset-request")
    public ResponseEntity<EmailVerificationResponse> requestPasswordReset(
            @Valid @RequestBody PasswordResetRequest request) {
        
        try {
            passwordResetService.requestPasswordReset(request.getEmail());
            return ResponseEntity.ok(
                    EmailVerificationResponse.success("비밀번호 재설정 링크가 이메일로 발송되었습니다.")
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    EmailVerificationResponse.error(e.getMessage())
            );
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(
                    EmailVerificationResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            log.error("비밀번호 재설정 요청 실패", e);
            return ResponseEntity.internalServerError().body(
                    EmailVerificationResponse.error("비밀번호 재설정 요청에 실패했습니다. 잠시 후 다시 시도해주세요.")
            );
        }
    }

    /**
     * 토큰 검증
     */
    @GetMapping("/validate-token")
    public ResponseEntity<EmailVerificationResponse> validateToken(@RequestParam String token) {
        boolean isValid = passwordResetService.validateToken(token);
        
        if (isValid) {
            return ResponseEntity.ok(
                    EmailVerificationResponse.success("유효한 토큰입니다.")
            );
        } else {
            return ResponseEntity.badRequest().body(
                    EmailVerificationResponse.error("유효하지 않거나 만료된 토큰입니다.")
            );
        }
    }

    /**
     * 비밀번호 재설정
     */
    @PostMapping("/reset")
    public ResponseEntity<EmailVerificationResponse> resetPassword(
            @Valid @RequestBody NewPasswordRequest request) {
        
        try {
            passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(
                    EmailVerificationResponse.success("비밀번호가 성공적으로 변경되었습니다.")
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    EmailVerificationResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            log.error("비밀번호 재설정 실패", e);
            return ResponseEntity.internalServerError().body(
                    EmailVerificationResponse.error("비밀번호 재설정에 실패했습니다. 잠시 후 다시 시도해주세요.")
            );
        }
    }
}
