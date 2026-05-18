package com.example.locc.exception;

import org.springframework.security.core.AuthenticationException;

/**
 * 소셜 로그인 시 이메일이 기존 일반(LOCAL) 계정과 충돌하는 경우
 * - 자동 병합 금지 정책에 따라 에러 처리
 * - OAuth2SuccessHandler → OAuth2FailureHandler 로 전달되어 프론트로 redirect
 */
public class EmailConflictException extends AuthenticationException {

    public EmailConflictException(String email) {
        super("이미 일반 회원으로 가입된 이메일입니다: " + email);
    }
}
