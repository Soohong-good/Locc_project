package com.example.locc.domain.application.dto.response;

import com.example.locc.domain.application.entity.FacilityApplication;
import com.example.locc.domain.application.entity.FacilityApplicationStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Builder
public class FacilityApplicationResponse {

    private Long                    id;
    private String                  categoryName;
    private String                  applicantName;
    private LocalDate               useDate;
    private LocalTime               useStartTime;
    private LocalTime               useEndTime;
    private String                  purpose;
    private Integer                 headCount;
    private FacilityApplicationStatus status;
    private String                  statusLabel;

    public static FacilityApplicationResponse from(FacilityApplication a) {
        return FacilityApplicationResponse.builder()
                .id(a.getId())
                .categoryName(a.getCategory().getName())
                .applicantName(a.getUser().getName())
                .useDate(a.getUseDate())
                .useStartTime(a.getUseStartTime())
                .useEndTime(a.getUseEndTime())
                .purpose(a.getPurpose())
                .headCount(a.getHeadCount())
                .status(a.getStatus())
                .statusLabel(a.getStatus().getLabel())
                .build();
    }
}
