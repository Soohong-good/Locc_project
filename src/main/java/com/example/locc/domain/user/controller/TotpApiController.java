package com.example.locc.domain.user.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.config.JwtProperties;
import com.example.locc.domain.user.dto.response.UserAuthResponse;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.service.UserCommandService;
import com.example.locc.domain.user.service.UserQueryService;
import com.example.locc.exception.InvalidInputException;
import com.example.locc.security.CookieUtil;
import com.example.locc.security.JwtTokenProvider;
import com.example.locc.security.TotpService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth/totp")
@RequiredArgsConstructor
public class TotpApiController {

    private final TotpService totpService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserQueryService userQueryService;
    private final UserCommandService userCommandService;
    private final CookieUtil cookieUtil;
    private final JwtProperties jwtProperties;

    /**
     * TOTP QR 코드 발급 (ADMIN 전용, 로그인 상태)
     */
    @PostMapping("/setup")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> setup(Authentication authentication) {
        User user = userQueryService.findByEmail(authentication.getName());
        String secret = totpService.generateSecret();
        user.setupTotp(secret);
        String qrUri = totpService.generateQrCodeImageUri(secret, user.getEmail());
        log.info("TOTP setup initiated for admin: {}", user.getEmail());
        return ResponseEntity.ok(ApiResponse.ok(Map.of("qrCode", qrUri)));
    }

    /**
     * TOTP 활성화 (ADMIN 전용, 로그인 상태)
     */
    @PostMapping("/enable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> enable(
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String code = body.get("code");
        User user = userQueryService.findByEmail(authentication.getName());

        if (user.getTotpSecret() == null) {
            throw new InvalidInputException("QR 코드를 먼저 발급받으세요.");
        }
        if (!totpService.verifyCode(user.getTotpSecret(), code)) {
            throw new InvalidInputException("인증 코드가 올바르지 않습니다.");
        }

        user.enableTotp();
        log.info("TOTP enabled for admin: {}", user.getEmail());
        return ResponseEntity.ok(ApiResponse.ok(null, "2차 인증이 활성화되었습니다."));
    }

    /**
     * TOTP 코드 검증 (공개, 비로그인)
     * preAuthToken + 6자리 코드 → JWT 쿠키 발급
     */
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<UserAuthResponse>> verify(
            @RequestBody Map<String, String> body,
            HttpServletResponse response) {
        String preAuthToken = body.get("preAuthToken");
        String code = body.get("code");

        String email;
        try {
            email = jwtTokenProvider.getEmailFromPreAuthToken(preAuthToken);
        } catch (Exception e) {
            throw new InvalidInputException("유효하지 않거나 만료된 인증 세션입니다.");
        }

        User user = userQueryService.findByEmail(email);

        if (!totpService.verifyCode(user.getTotpSecret(), code)) {
            log.warn("TOTP 인증 실패: {}", email);
            throw new InvalidInputException("인증 코드가 올바르지 않습니다.");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);
        userCommandService.saveOrUpdateRefreshTokenPublic(user, refreshToken);

        cookieUtil.addAccessTokenCookie(response, accessToken);
        cookieUtil.addRefreshTokenCookie(response, refreshToken);

        log.info("TOTP 인증 성공: {}", email);

        UserAuthResponse auth = UserAuthResponse.builder()
                .tokenType("Bearer")
                .expiresIn(jwtProperties.getExpiration())
                .username(user.getName())
                .role(user.getRole().name())
                .message("로그인에 성공했습니다.")
                .build();

        return ResponseEntity.ok(ApiResponse.ok(auth));
    }
}
