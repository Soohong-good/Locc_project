package com.example.locc.exception;

import lombok.Getter;
import org.springframework.security.core.AuthenticationException;

/**
 * 소셜 로그인 시 이메일이 기존 일반(LOCAL) 계정과 충돌하는 경우
 * - 자동 병합 금지 정책에 따라 에러 처리
 * - OAuth2SuccessHandler → OAuth2FailureHandler 로 전달되어 프론트로 redirect
 * - provider/providerId를 함께 담아 OAuth2FailureHandler가 연결용 임시 토큰을 발급할 수 있게 한다
 */
@Getter
public class EmailConflictException extends AuthenticationException {

    private final String email;
    private final String provider;
    private final String providerId;

    public EmailConflictException(String email, String provider, String providerId) {
        super("이미 일반 회원으로 가입된 이메일입니다: " + email);
        this.email = email;
        this.provider = provider;
        this.providerId = providerId;
    }
}
