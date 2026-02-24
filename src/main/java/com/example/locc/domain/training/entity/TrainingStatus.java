package com.example.locc.domain.training.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 훈련 상태
 */
@Getter
@RequiredArgsConstructor
public enum TrainingStatus {
    OPEN("신청가능"),
    CLOSED("마감");

    private final String description;
}
