package com.example.locc.domain.training.dto.response;

import com.example.locc.domain.training.entity.TrainingApplication;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 신청서 응답 DTO
 */
@Getter
@Builder
public class ApplicationResponse {

    private final Long id;
    private final Long trainingId;
    private final String trainingTitle;
    private final String userName;
    private final String phone;
    private final String paymentMethod;
    private final int trainingFee;
    private final LocalDateTime appliedAt;

    /**
     * Entity to Response
     */
    public static ApplicationResponse from(TrainingApplication application) {
        return ApplicationResponse.builder()
                .id(application.getId())
                .trainingId(application.getTraining().getId())
                .trainingTitle(application.getTraining().getTitle())
                .userName(application.getUser().getName())
                .phone(application.getPhone())
                .paymentMethod(application.getPaymentMethod())
                .trainingFee(application.getTraining().getTrainingFee())
                .appliedAt(application.getAppliedAt())
                .build();
    }
}
