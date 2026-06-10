package com.example.locc.domain.sermon.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

/**
 * 주일오전 날짜별 상세 응답 DTO
 * - 리스트용 SundayMorningGroupResponse와 달리 content + attachments 포함
 * - GET /api/sermons/sunday-morning/date/{date} 전용
 */
@Getter
@Builder
public class SundayMorningGroupDetailResponse {

    private final LocalDate sermonDate;

    /** 1부 설교 전체 상세 (없으면 null) */
    private final SermonDetailResponse part1;

    /** 2부 설교 전체 상세 (없으면 null) */
    private final SermonDetailResponse part2;

    public static SundayMorningGroupDetailResponse of(
            LocalDate sermonDate, SermonDetailResponse part1, SermonDetailResponse part2) {
        return SundayMorningGroupDetailResponse.builder()
                .sermonDate(sermonDate)
                .part1(part1)
                .part2(part2)
                .build();
    }
}
