package com.example.locc.domain.application.dto.response;

import com.example.locc.domain.application.entity.FacilityCategory;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FacilityCategoryResponse {

    private Long    id;
    private String  name;
    private String  description;
    private Boolean isActive;
    private Integer sortOrder;

    public static FacilityCategoryResponse from(FacilityCategory category) {
        return FacilityCategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .isActive(category.getIsActive())
                .sortOrder(category.getSortOrder())
                .build();
    }
}
