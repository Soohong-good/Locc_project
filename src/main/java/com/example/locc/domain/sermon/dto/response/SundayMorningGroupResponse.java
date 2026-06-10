package com.example.locc.domain.sermon.dto.response;

import com.example.locc.domain.sermon.entity.Sermon;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

/**
 * 주일오전 날짜별 그룹 응답 DTO
 * - 동일 날짜의 1부/2부 설교를 하나의 그룹으로 묶어 반환
 * - 리스트 아이템 및 상세 조회 공통 사용
 */
@Getter
@Builder
public class SundayMorningGroupResponse {

    private final LocalDate sermonDate;

    /** 1부 설교 (없으면 null) */
    private final SermonResponse part1;

    /** 2부 설교 (없으면 null) */
    private final SermonResponse part2;

    /**
     * 대표 설교자 (1부 우선, 없으면 2부)
     */
    public String getRepresentativePreacher() {
        if (part1 != null && part1.getPreacher() != null) return part1.getPreacher();
        if (part2 != null && part2.getPreacher() != null) return part2.getPreacher();
        return null;
    }

    /**
     * 대표 제목 (1부 우선, 없으면 2부)
     */
    public String getRepresentativeTitle() {
        if (part1 != null && part1.getTitle() != null) return part1.getTitle();
        if (part2 != null && part2.getTitle() != null) return part2.getTitle();
        return null;
    }

    /**
     * 팩토리 메서드
     */
    public static SundayMorningGroupResponse of(LocalDate date, SermonResponse part1, SermonResponse part2) {
        return SundayMorningGroupResponse.builder()
                .sermonDate(date)
                .part1(part1)
                .part2(part2)
                .build();
    }

    /**
     * Sermon 리스트로부터 그룹 생성
     * - serviceNumber null 또는 1 → 1부
     * - serviceNumber 2 → 2부
     */
    public static SundayMorningGroupResponse fromSermons(LocalDate date, List<Sermon> sermons) {
        SermonResponse part1 = sermons.stream()
                .filter(s -> s.getServiceNumber() == null || Integer.valueOf(1).equals(s.getServiceNumber()))
                .findFirst()
                .map(SermonResponse::from)
                .orElse(null);
        SermonResponse part2 = sermons.stream()
                .filter(s -> Integer.valueOf(2).equals(s.getServiceNumber()))
                .findFirst()
                .map(SermonResponse::from)
                .orElse(null);
        return of(date, part1, part2);
    }
}
