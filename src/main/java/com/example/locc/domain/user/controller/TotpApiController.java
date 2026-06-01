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
     * QR 코드 발급 (로그인 흐름 중, preAuthToken 기반)
     */
    @PostMapping("/setup")
    public ResponseEntity<ApiResponse<Map<String, String>>> setup(
            @RequestBody Map<String, String> body) {
        String preAuthToken = body.get("preAuthToken");
        if (preAuthToken == null) throw new InvalidInputException("preAuthToken은 필수입니다.");

        String qrUri = userCommandService.setupTotp(preAuthToken);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("qrCode", qrUri)));
    }

    /**
     * TOTP 활성화 (첫 코드 검증 → JWT 발급)
     */
    @PostMapping("/enable")
    public ResponseEntity<ApiResponse<UserAuthResponse>> enable(
            @RequestBody Map<String, String> body,
            HttpServletResponse response) {
        String preAuthToken = body.get("preAuthToken");
        String code = body.get("code");
        if (preAuthToken == null || code == null) throw new InvalidInputException("preAuthToken과 code는 필수입니다.");

        User user = userCommandService.enableTotpAndGetUser(preAuthToken, code);
        return issueJwt(user, response, "2차 인증이 활성화되었습니다.");
    }

    /**
     * TOTP 코드 검증 (이미 설정된 경우 → JWT 발급)
     */
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<UserAuthResponse>> verify(
            @RequestBody Map<String, String> body,
            HttpServletResponse response) {
        String preAuthToken = body.get("preAuthToken");
        String code = body.get("code");
        if (preAuthToken == null || code == null) throw new InvalidInputException("preAuthToken과 code는 필수입니다.");

        User user = userCommandService.verifyTotpAndGetUser(preAuthToken, code);
        return issueJwt(user, response, "로그인에 성공했습니다.");
    }

    private ResponseEntity<ApiResponse<UserAuthResponse>> issueJwt(
            User user, HttpServletResponse response, String message) {
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);
        userCommandService.saveOrUpdateRefreshTokenPublic(user, refreshToken);

        cookieUtil.addAccessTokenCookie(response, accessToken);
        cookieUtil.addRefreshTokenCookie(response, refreshToken);

        log.info("TOTP 로그인 완료: {}", user.getEmail());

        return ResponseEntity.ok(ApiResponse.ok(
                UserAuthResponse.builder()
                        .tokenType("Bearer")
                        .expiresIn(jwtProperties.getExpiration())
                        .username(user.getName())
                        .role(user.getRole().name())
                        .message(message)
                        .build()
        ));
    }
}
