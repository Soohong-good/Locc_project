package com.example.locc.domain.user.entity;

/**
 * 사용자 뷰 페이지 영역 구분
 * - 관리자 대시보드 기능 제외
 * - 일반 사용자에게 작성 권한을 부여할 수 있는 영역
 */
public enum AreaType {
    NOTICE,       // 공지사항
    BULLETIN,     // 주보
    PRAISE_SHEET, // 찬양악보
    DEPARTMENT    // 부서
}
