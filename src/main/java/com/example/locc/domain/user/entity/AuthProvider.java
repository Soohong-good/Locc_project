package com.example.locc.domain.user.entity;

/**
 * 인증 제공자 (로컬/소셜 로그인)
 */
public enum AuthProvider {
    LOCAL,   // 로컬 회원가입
    KAKAO,   // 카카오 로그인
    NAVER    // 네이버 로그인
}
