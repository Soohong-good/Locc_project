package com.example.locc.domain.department.dto.response;

import com.example.locc.domain.department.entity.Department;
import lombok.Getter;

@Getter
public class DepartmentResponse {
    
    private final Long id;
    private final String code;
    private final String name;
    private final String nameEn;
    private final String description;
    private final String worshipTime;
    private final String worshipTimeEn;
    private final String worshipLocation;
    private final String worshipLocationEn;
    private final String feature1;
    private final String feature2;
    private final String feature3;
    private final String youtubeChannelId;
    private final String latestVideoId;
    private final String latestVideoTitle;

    private DepartmentResponse(Long id, String code, String name, String nameEn, String description,
                              String worshipTime, String worshipTimeEn, String worshipLocation, String worshipLocationEn,
                              String feature1, String feature2, String feature3,
                              String youtubeChannelId, String latestVideoId, String latestVideoTitle) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.nameEn = nameEn;
        this.description = description;
        this.worshipTime = worshipTime;
        this.worshipTimeEn = worshipTimeEn;
        this.worshipLocation = worshipLocation;
        this.worshipLocationEn = worshipLocationEn;
        this.feature1 = feature1;
        this.feature2 = feature2;
        this.feature3 = feature3;
        this.youtubeChannelId = youtubeChannelId;
        this.latestVideoId = latestVideoId;
        this.latestVideoTitle = latestVideoTitle;
    }

    public static DepartmentResponse from(Department department) {
        return new DepartmentResponse(
            department.getId(),
            department.getCode(),
            department.getName(),
            department.getNameEn(),
            department.getDescription(),
            department.getWorshipTime(),
            department.getWorshipTimeEn(),
            department.getWorshipLocation(),
            department.getWorshipLocationEn(),
            department.getFeature1(),
            department.getFeature2(),
            department.getFeature3(),
            department.getYoutubeChannelId(),
            department.getLatestVideoId(),
            department.getLatestVideoTitle()
        );
    }
}
