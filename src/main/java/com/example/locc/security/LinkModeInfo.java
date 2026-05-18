package com.example.locc.security;

import java.util.UUID;

/**
 * 소셜 계정 연결 모드 정보
 * - 세션에 저장되어 OAuth2 콜백에서 복원됨
 * - mode=link 일 때만 생성
 */
public record LinkModeInfo(UUID userId) {

    public static final String SESSION_KEY = "OAUTH2_LINK_MODE";
}
