package com.example.locc.domain.department.dto.response;

import com.example.locc.domain.department.entity.Department;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
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

    // Redis 캐시 역직렬화를 위해 @JsonCreator 추가
    @JsonCreator
    public DepartmentResponse(
            @JsonProperty("id")                 Long id,
            @JsonProperty("code")               String code,
            @JsonProperty("name")               String name,
            @JsonProperty("nameEn")             String nameEn,
            @JsonProperty("description")        String description,
            @JsonProperty("worshipTime")        String worshipTime,
            @JsonProperty("worshipTimeEn")      String worshipTimeEn,
            @JsonProperty("worshipLocation")    String worshipLocation,
            @JsonProperty("worshipLocationEn")  String worshipLocationEn,
            @JsonProperty("feature1")           String feature1,
            @JsonProperty("feature2")           String feature2,
            @JsonProperty("feature3")           String feature3,
            @JsonProperty("youtubeChannelId")   String youtubeChannelId,
            @JsonProperty("latestVideoId")      String latestVideoId,
            @JsonProperty("latestVideoTitle")   String latestVideoTitle) {
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
