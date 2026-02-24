package com.example.locc.domain.popup.entity;

/**
 * 팝업 노출 대상 타입
 */
public enum TargetType {
    ALL("전체"),
    MEMBER_ONLY("회원만"),
    GUEST_ONLY("비회원만");

    private final String description;

    TargetType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
