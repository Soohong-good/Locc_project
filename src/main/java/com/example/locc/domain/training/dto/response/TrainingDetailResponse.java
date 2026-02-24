package com.example.locc.domain.training.dto.response;

import com.example.locc.domain.training.entity.Training;
import com.example.locc.domain.training.entity.TrainingStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 훈련 상세 조회 응답 DTO
 */
@Getter
@Builder
public class TrainingDetailResponse {

    private final Long id;
    private final String title;
    private final String description;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final LocalDateTime applicationDeadline;
    private final int trainingFee;
    private final int maxParticipants;
    private final TrainingStatus status;
    private final String creatorName;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
    private final boolean canApply;

    /**
     * Entity to DetailResponse
     */
    public static TrainingDetailResponse from(Training training) {
        return TrainingDetailResponse.builder()
                .id(training.getId())
                .title(training.getTitle())
                .description(training.getDescription())
                .startDate(training.getStartDate())
                .endDate(training.getEndDate())
                .applicationDeadline(training.getApplicationDeadline())
                .trainingFee(training.getTrainingFee())
                .maxParticipants(training.getMaxParticipants())
                .status(training.getCurrentStatus())  // 동적 상태 사용
                .creatorName(training.getCreatedBy() != null ? 
                        training.getCreatedBy().getName() : "알 수 없음")
                .createdAt(training.getCreatedAt())
                .updatedAt(training.getUpdatedAt())
                .canApply(training.canApply())
                .build();
    }
}
