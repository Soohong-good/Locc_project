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

    /**
     * 토큰을 제외한 사용자 식별 정보만 담은 응답 생성
     * - HttpOnly 쿠키로 토큰을 전달하는 경우 바디에서 토큰 제거 용도
     */
    public UserAuthResponse withoutTokens() {
        return UserAuthResponse.builder()
                .tokenType(this.tokenType)
                .expiresIn(this.expiresIn)
                .username(this.username)
                .role(this.role)
                .message(this.message)
                .build();
    }
}
