package com.example.locc.domain.application.dto.response;

import com.example.locc.domain.application.entity.FacilityApplication;
import com.example.locc.domain.application.entity.FacilityApplicationStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Builder
public class FacilityApplicationDetailResponse {

    private Long                    id;
    private Long                    categoryId;
    private String                  categoryName;
    private String                  applicantName;
    private String                  applicantEmail;
    private LocalDate               useDate;
    private LocalTime               useStartTime;
    private LocalTime               useEndTime;
    private String                  purpose;
    private Integer                 headCount;
    private String                  memo;
    private String                  adminMemo;
    private FacilityApplicationStatus status;
    private String                  statusLabel;

    public static FacilityApplicationDetailResponse from(FacilityApplication a) {
        return FacilityApplicationDetailResponse.builder()
                .id(a.getId())
                .categoryId(a.getCategory().getId())
                .categoryName(a.getCategory().getName())
                .applicantName(a.getUser().getName())
                .applicantEmail(a.getUser().getEmail())
                .useDate(a.getUseDate())
                .useStartTime(a.getUseStartTime())
                .useEndTime(a.getUseEndTime())
                .purpose(a.getPurpose())
                .headCount(a.getHeadCount())
                .memo(a.getMemo())
                .adminMemo(a.getAdminMemo())
                .status(a.getStatus())
                .statusLabel(a.getStatus().getLabel())
                .build();
    }
}
