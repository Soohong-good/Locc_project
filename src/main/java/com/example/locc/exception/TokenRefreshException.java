package com.example.locc.exception;

public class TokenRefreshException extends RuntimeException {

    private final String userMessage;

    public TokenRefreshException(String token, String message) {
        // 로그에는 토큰 포함 (서버 내부용)
        super(String.format("Failed for [%s]: %s", token, message));
        // 사용자에게 노출할 메시지는 별도 보관
        this.userMessage = message;
    }

    public String getUserMessage() {
        return userMessage;
    }
}