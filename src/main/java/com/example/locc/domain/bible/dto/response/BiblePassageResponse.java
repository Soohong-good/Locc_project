package com.example.locc.domain.bible.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 성경 본문 구간 응답
 */
@Getter
@Builder
public class BiblePassageResponse {

    private String version;     // 개역개정
    private String bookName;    // 고린도후서
    private int chapter;        // 9
    private int startVerse;     // 1
    private int endVerse;       // 15
    private String reference;   // 표시용: "고린도후서 9:1-15"
    private List<Verse> verses;

    @Getter
    @Builder
    public static class Verse {
        private int verse;
        private String text;
    }
}
