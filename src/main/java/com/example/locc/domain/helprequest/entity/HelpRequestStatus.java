package com.example.locc.domain.helprequest.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 도움 요청 처리 상태
 */
@Getter
@RequiredArgsConstructor
public enum HelpRequestStatus {
    PENDING("대기중"),
    IN_PROGRESS("처리중"),
    COMPLETED("완료");

    private final String description;
}
