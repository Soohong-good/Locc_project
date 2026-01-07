package com.example.locc.domain.user.dto.response;

import lombok.Builder;
import lombok.Getter;

/**
 * User 인증 Response DTO
 * - 로그인, 회원가입 후 토큰 정보 반환
 */
@Getter
@Builder
public class UserAuthResponse {

    private final String accessToken;
    private final String refreshToken;
    private final String tokenType;
    private final Long expiresIn;
    private final String username;
    private final String role;
    private final String message;
}
