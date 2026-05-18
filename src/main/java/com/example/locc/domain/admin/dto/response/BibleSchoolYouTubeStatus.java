package com.example.locc.domain.admin.dto.response;

import com.example.locc.domain.bibleschool.entity.BibleSchool;

/**
 * 성경학교 YouTube 현황 응답 DTO
 */
public record BibleSchoolYouTubeStatus(
        String title,
        String youtubePlaylistId,
        String latestVideoId,
        String latestVideoTitle
) {
    public static BibleSchoolYouTubeStatus from(BibleSchool entity) {
        return new BibleSchoolYouTubeStatus(
                entity.getTitle(),
                entity.getYoutubePlaylistId(),
                entity.getLatestVideoId(),
                entity.getLatestVideoTitle()
        );
    }

    public static BibleSchoolYouTubeStatus empty() {
        return new BibleSchoolYouTubeStatus("성경학교", null, null, null);
    }
}