package com.example.locc.domain.user.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.config.JwtProperties;
import com.example.locc.domain.user.dto.response.UserAuthResponse;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.service.UserCommandService;
import com.example.locc.exception.InvalidInputException;
import com.example.locc.security.CookieUtil;
import com.example.locc.security.JwtTokenProvider;
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

    private final JwtTokenProvider jwtTokenProvider;
    private final UserCommandService userCommandService;
    private final CookieUtil cookieUtil;
    private final JwtProperties jwtProperties;

    /**
     * TOTP QR 코드 발급 (ADMIN 전용, 로그인 상태)
     */
    @PostMapping("/setup")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> setup(Authentication authentication) {
        String qrUri = userCommandService.setupTotp(authentication.getName());
        log.info("TOTP setup initiated for admin: {}", authentication.getName());
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
        userCommandService.enableTotp(authentication.getName(), body.get("code"));
        log.info("TOTP enabled for admin: {}", authentication.getName());
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

        if (preAuthToken == null || code == null) {
            throw new InvalidInputException("preAuthToken과 code는 필수입니다.");
        }

        User user = userCommandService.verifyTotpAndGetUser(preAuthToken, code);

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);
        userCommandService.saveOrUpdateRefreshTokenPublic(user, refreshToken);

        cookieUtil.addAccessTokenCookie(response, accessToken);
        cookieUtil.addRefreshTokenCookie(response, refreshToken);

        log.info("TOTP 인증 성공: {}", user.getEmail());

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
