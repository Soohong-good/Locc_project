package com.example.locc.domain.social.controller;

import com.example.locc.domain.auth.dto.response.EmailVerificationResponse;
import com.example.locc.domain.social.dto.request.SocialAdditionalInfoRequest;
import com.example.locc.domain.social.service.SocialRegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 소셜 로그인 추가 회원가입 API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/social")
@RequiredArgsConstructor
public class SocialRegistrationApiController {

    private final SocialRegistrationService socialRegistrationService;

    /**
     * 소셜 추가 정보 입력으로 회원가입 완료
     */
    @PostMapping("/complete-registration")
    public ResponseEntity<EmailVerificationResponse> completeRegistration(
            @RequestParam String token,
            @Valid @RequestBody SocialAdditionalInfoRequest request) {
        
        try {
            socialRegistrationService.completeSocialRegistration(token, request);
            return ResponseEntity.ok(
                    EmailVerificationResponse.success("회원가입이 완료되었습니다. 관리자 승인 후 이용 가능합니다.")
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
            log.error("소셜 추가 정보 입력 실패", e);
            return ResponseEntity.internalServerError().body(
                    EmailVerificationResponse.error("회원가입 처리 중 오류가 발생했습니다.")
            );
        }
    }
}
