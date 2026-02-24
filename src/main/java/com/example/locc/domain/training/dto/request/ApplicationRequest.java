package com.example.locc.domain.training.dto.request;

import com.example.locc.domain.training.dto.command.CreateApplicationCommand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

/**
 * 훈련 신청 요청 DTO
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationRequest {

    @NotNull(message = "훈련 ID는 필수입니다")
    private Long trainingId;

    @NotBlank(message = "연락처는 필수입니다")
    @Pattern(regexp = "^01[0-9]-[0-9]{3,4}-[0-9]{4}$", 
             message = "올바른 휴대폰 번호 형식이 아닙니다 (예: 010-1234-5678)")
    private String phone;

    @NotBlank(message = "납부방법을 선택하세요")
    private String paymentMethod;

    /**
     * CreateApplicationCommand로 변환
     */
    public CreateApplicationCommand toCommand() {
        return new CreateApplicationCommand(
                this.trainingId,
                this.phone,
                this.paymentMethod
        );
    }
}
