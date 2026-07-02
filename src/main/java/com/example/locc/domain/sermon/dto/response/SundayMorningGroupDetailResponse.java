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

    /** 이전 설교 날짜 (없으면 null) — 상세 페이지 "이전 설교 보기" 네비게이션용 */
    private final LocalDate prevDate;

    /** 다음 설교 날짜 (없으면 null) — 상세 페이지 "다음 설교 보기" 네비게이션용 */
    private final LocalDate nextDate;

    public static SundayMorningGroupDetailResponse of(
            LocalDate sermonDate, SermonDetailResponse part1, SermonDetailResponse part2,
            LocalDate prevDate, LocalDate nextDate) {
        return SundayMorningGroupDetailResponse.builder()
                .sermonDate(sermonDate)
                .part1(part1)
                .part2(part2)
                .prevDate(prevDate)
                .nextDate(nextDate)
                .build();
    }
}
