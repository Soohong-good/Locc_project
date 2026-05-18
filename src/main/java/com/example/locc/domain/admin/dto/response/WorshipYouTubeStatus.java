package com.example.locc.domain.admin.dto.response;

import com.example.locc.domain.newyear.dto.response.NewYearResponse;

/**
 * 예배 YouTube 현황 응답 DTO
 * - 송구영신예배 + 성경학교 YouTube 현황을 묶어 반환
 */
public record WorshipYouTubeStatus(
        NewYearResponse newYear,
        BibleSchoolYouTubeStatus bibleSchool
) {}
