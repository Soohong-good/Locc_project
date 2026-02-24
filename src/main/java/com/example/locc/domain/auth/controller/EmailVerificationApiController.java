package com.example.locc.domain.auth.controller;

import com.example.locc.domain.auth.dto.request.EmailVerificationRequest;
import com.example.locc.domain.auth.dto.request.VerifyCodeRequest;
import com.example.locc.domain.auth.dto.response.EmailVerificationResponse;
import com.example.locc.domain.auth.service.EmailVerificationService;
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
     */
    @PostMapping("/send-code")
    public ResponseEntity<EmailVerificationResponse> sendVerificationCode(
            @Valid @RequestBody EmailVerificationRequest request) {
        
        long startTime = System.currentTimeMillis();
        log.info("=== 이메일 인증 요청 시작: {}", request.getEmail());
        
        try {
            long beforeService = System.currentTimeMillis();
            emailVerificationService.sendVerificationCode(request.getEmail());
            long afterService = System.currentTimeMillis();
            
            log.info("=== 서비스 처리 완료 ({}ms): {}", afterService - beforeService, request.getEmail());
            
            ResponseEntity<EmailVerificationResponse> response = ResponseEntity.ok(
                    EmailVerificationResponse.success("인증 코드가 발송되었습니다. 이메일을 확인해주세요.")
            );
            
            long endTime = System.currentTimeMillis();
            log.info("=== 전체 요청 완료 ({}ms): {}", endTime - startTime, request.getEmail());
            
            return response;
            
        } catch (IllegalStateException e) {
            // 재발송 쿨다운
            long remainingSeconds = emailVerificationService.getRemainingCooldown(request.getEmail());
            log.warn("=== 쿨다운 중 ({}초 남음): {}", remainingSeconds, request.getEmail());
            return ResponseEntity.badRequest().body(
                    EmailVerificationResponse.error(
                            String.format("인증 코드는 1분에 한 번만 요청할 수 있습니다. (%d초 후 재시도 가능)", remainingSeconds)
                    )
            );
        } catch (Exception e) {
            log.error("=== 인증 코드 발송 실패", e);
            return ResponseEntity.internalServerError().body(
                    EmailVerificationResponse.error("인증 코드 발송에 실패했습니다. 잠시 후 다시 시도해주세요.")
            );
        }
    }

    /**
     * 인증 코드 검증
     */
    @PostMapping("/verify-code")
    public ResponseEntity<EmailVerificationResponse> verifyCode(
            @Valid @RequestBody VerifyCodeRequest request) {
        
        boolean isValid = emailVerificationService.verifyCode(request.getEmail(), request.getCode());
        
        if (isValid) {
            return ResponseEntity.ok(
                    EmailVerificationResponse.success("이메일 인증이 완료되었습니다.")
            );
        } else {
            return ResponseEntity.badRequest().body(
                    EmailVerificationResponse.error("인증 코드가 일치하지 않거나 만료되었습니다.")
            );
        }
    }

    /**
     * 남은 쿨다운 시간 조회
     */
    @GetMapping("/cooldown")
    public ResponseEntity<Long> getRemainingCooldown(@RequestParam String email) {
        long remainingSeconds = emailVerificationService.getRemainingCooldown(email);
        return ResponseEntity.ok(remainingSeconds);
    }
}
