package com.example.locc.domain.application.dto.command;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Builder
public class FacilityCreateCommand {
    private String    formType;   // 신청 종류 이름 (예: 차량신청) — 카테고리 자동 생성
    private String    userEmail;
    private LocalDate useDate;
    private LocalTime useStartTime;
    private LocalTime useEndTime;
    private String    purpose;
    private Integer   headCount;
    private String    memo;
}
