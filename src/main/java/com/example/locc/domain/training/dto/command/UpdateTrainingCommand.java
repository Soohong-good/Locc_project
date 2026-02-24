package com.example.locc.domain.training.dto.command;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 훈련 수정 커맨드
 */
public record UpdateTrainingCommand(
        String title,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        LocalDateTime applicationDeadline,
        int trainingFee,
        int maxParticipants
) {
}
