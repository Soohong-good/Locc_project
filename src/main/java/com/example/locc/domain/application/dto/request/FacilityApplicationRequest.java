package com.example.locc.domain.application.dto.request;

import com.example.locc.domain.application.dto.command.FacilityCreateCommand;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacilityApplicationRequest {

    @NotNull(message = "신청 카테고리를 선택해주세요")
    private Long categoryId;

    @NotNull(message = "사용 날짜를 선택해주세요")
    private LocalDate useDate;

    @NotNull(message = "시작 시간을 입력해주세요")
    private LocalTime useStartTime;

    @NotNull(message = "종료 시간을 입력해주세요")
    private LocalTime useEndTime;

    @NotBlank(message = "사용 목적을 입력해주세요")
    @Size(max = 200)
    private String purpose;

    @NotNull(message = "인원을 입력해주세요")
    @Min(value = 1, message = "인원은 1명 이상이어야 합니다")
    private Integer headCount;

    @Size(max = 1000)
    private String memo;

    public FacilityCreateCommand toCreateCommand(String userEmail) {
        return FacilityCreateCommand.builder()
                .categoryId(this.categoryId)
                .userEmail(userEmail)
                .useDate(this.useDate)
                .useStartTime(this.useStartTime)
                .useEndTime(this.useEndTime)
                .purpose(this.purpose)
                .headCount(this.headCount)
                .memo(this.memo)
                .build();
    }
}
