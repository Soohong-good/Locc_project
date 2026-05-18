package com.example.locc.domain.training.dto.response;

import com.example.locc.domain.training.entity.Training;
import com.example.locc.domain.training.entity.TrainingStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 훈련 목록 조회 응답 DTO
 */
@Getter
@Builder
public class TrainingResponse {

    private final Long id;
    private final String title;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final LocalDateTime applicationDeadline;
    private final int trainingFee;
    private final int maxParticipants;
    private final TrainingStatus status;
    private final String creatorName;
    private final String creatorId;   // 작성자 UUID — 프론트 본인 여부 판단용
    private final LocalDateTime createdAt;
    private final boolean canApply;

    /**
     * Entity to Response
     */
    public static TrainingResponse from(Training training) {
        return TrainingResponse.builder()
                .id(training.getId())
                .title(training.getTitle())
                .startDate(training.getStartDate())
                .endDate(training.getEndDate())
                .applicationDeadline(training.getApplicationDeadline())
                .trainingFee(training.getTrainingFee())
                .maxParticipants(training.getMaxParticipants())
                .status(training.getCurrentStatus())  // 동적 상태 사용
                .creatorName(training.getCreatedBy() != null ? 
                        training.getCreatedBy().getName() : "알 수 없음")
                .creatorId(training.getCreatedBy() != null ?
                        training.getCreatedBy().getId().toString() : null)
                .createdAt(training.getCreatedAt())
                .canApply(training.canApply())
                .build();
    }
}
