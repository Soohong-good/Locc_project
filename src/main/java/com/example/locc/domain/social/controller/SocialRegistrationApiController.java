package com.example.locc.domain.social.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.domain.social.dto.request.SocialAdditionalInfoRequest;
import com.example.locc.domain.social.service.SocialRegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * 소셜 로그인 추가 회원가입 API 컨트롤러
 * IllegalArgumentException/IllegalStateException → RestExceptionHandler(400) 처리
 */
@Slf4j
@RestController
@RequestMapping("/api/social")
@RequiredArgsConstructor
public class SocialRegistrationApiController {

    private final SocialRegistrationService socialRegistrationService;

    @PostMapping("/complete-registration")
    public ResponseEntity<ApiResponse<Void>> completeRegistration(
            @RequestParam String token,
            @Valid @RequestBody SocialAdditionalInfoRequest request) {

        socialRegistrationService.completeSocialRegistration(token, request);
        return ResponseEntity.ok(ApiResponse.ok(null, "회원가입이 완료되었습니다. 관리자 승인 후 이용 가능합니다."));
    }

    /**
     * 이메일 충돌 후 소셜 계정 연결
     * - 로그인 필수(SecurityConfig의 anyRequest().authenticated()로 보호)
     * - linkToken의 이메일과 현재 로그인한 계정의 이메일이 일치할 때만 연결
     */
    @PostMapping("/link-account")
    public ResponseEntity<ApiResponse<Void>> linkAccount(
            @RequestParam String linkToken,
            Authentication authentication) {

        socialRegistrationService.linkSocialAccount(linkToken, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(null, "소셜 계정이 연결되었습니다."));
    }
}
