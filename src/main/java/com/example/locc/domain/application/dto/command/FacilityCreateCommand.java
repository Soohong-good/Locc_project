package com.example.locc.domain.application.dto.command;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Builder
public class FacilityCreateCommand {
    private Long      categoryId;
    private String    userEmail;
    private LocalDate useDate;
    private LocalTime useStartTime;
    private LocalTime useEndTime;
    private String    purpose;
    private Integer   headCount;
    private String    memo;
}
