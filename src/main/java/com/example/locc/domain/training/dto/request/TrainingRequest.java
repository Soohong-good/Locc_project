package com.example.locc.domain.training.dto.request;

import com.example.locc.domain.training.dto.command.CreateTrainingCommand;
import com.example.locc.domain.training.dto.command.UpdateTrainingCommand;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 훈련 생성/수정 요청 DTO
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainingRequest {

    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 200, message = "제목은 200자를 초과할 수 없습니다")
    private String title;

    private String description;

    @NotNull(message = "시작일은 필수입니다")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @NotNull(message = "종료일은 필수입니다")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    @NotNull(message = "신청 마감일은 필수입니다")
    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime applicationDeadline;

    @Min(value = 0, message = "훈련비는 0원 이상이어야 합니다")
    private int trainingFee;

    @Min(value = 1, message = "정원은 1명 이상이어야 합니다")
    private int maxParticipants;

    /**
     * CreateTrainingCommand로 변환
     */
    public CreateTrainingCommand toCreateCommand() {
        return new CreateTrainingCommand(
                this.title,
                this.description,
                this.startDate,
                this.endDate,
                this.applicationDeadline,
                this.trainingFee,
                this.maxParticipants
        );
    }

    /**
     * UpdateTrainingCommand로 변환
     */
    public UpdateTrainingCommand toUpdateCommand() {
        return new UpdateTrainingCommand(
                this.title,
                this.description,
                this.startDate,
                this.endDate,
                this.applicationDeadline,
                this.trainingFee,
                this.maxParticipants
        );
    }
}
