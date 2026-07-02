package com.example.locc.domain.bible.service;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 성경 66권 이름 매핑
 * - 입력(약칭/정식명) → DB book 컬럼 약칭(창, 고후 ...) 해석
 * - 약칭 → 정식명(표시용) 제공
 */
final class BibleBooks {

    private BibleBooks() {}

    /** 약칭 → 정식명 (DB book 컬럼 기준) */
    private static final Map<String, String> ABBR_TO_FULL = new LinkedHashMap<>();
    static {
        ABBR_TO_FULL.put("창", "창세기");        ABBR_TO_FULL.put("출", "출애굽기");      ABBR_TO_FULL.put("레", "레위기");
        ABBR_TO_FULL.put("민", "민수기");        ABBR_TO_FULL.put("신", "신명기");        ABBR_TO_FULL.put("수", "여호수아");
        ABBR_TO_FULL.put("삿", "사사기");        ABBR_TO_FULL.put("룻", "룻기");          ABBR_TO_FULL.put("삼상", "사무엘상");
        ABBR_TO_FULL.put("삼하", "사무엘하");     ABBR_TO_FULL.put("왕상", "열왕기상");     ABBR_TO_FULL.put("왕하", "열왕기하");
        ABBR_TO_FULL.put("대상", "역대상");       ABBR_TO_FULL.put("대하", "역대하");       ABBR_TO_FULL.put("스", "에스라");
        ABBR_TO_FULL.put("느", "느헤미야");       ABBR_TO_FULL.put("에", "에스더");         ABBR_TO_FULL.put("욥", "욥기");
        ABBR_TO_FULL.put("시", "시편");          ABBR_TO_FULL.put("잠", "잠언");          ABBR_TO_FULL.put("전", "전도서");
        ABBR_TO_FULL.put("아", "아가");          ABBR_TO_FULL.put("사", "이사야");         ABBR_TO_FULL.put("렘", "예레미야");
        ABBR_TO_FULL.put("애", "예레미야애가");    ABBR_TO_FULL.put("겔", "에스겔");         ABBR_TO_FULL.put("단", "다니엘");
        ABBR_TO_FULL.put("호", "호세아");         ABBR_TO_FULL.put("욜", "요엘");          ABBR_TO_FULL.put("암", "아모스");
        ABBR_TO_FULL.put("옵", "오바댜");         ABBR_TO_FULL.put("욘", "요나");          ABBR_TO_FULL.put("미", "미가");
        ABBR_TO_FULL.put("나", "나훔");          ABBR_TO_FULL.put("합", "하박국");         ABBR_TO_FULL.put("습", "스바냐");
        ABBR_TO_FULL.put("학", "학개");          ABBR_TO_FULL.put("슥", "스가랴");         ABBR_TO_FULL.put("말", "말라기");
        ABBR_TO_FULL.put("마", "마태복음");       ABBR_TO_FULL.put("막", "마가복음");       ABBR_TO_FULL.put("눅", "누가복음");
        ABBR_TO_FULL.put("요", "요한복음");       ABBR_TO_FULL.put("행", "사도행전");       ABBR_TO_FULL.put("롬", "로마서");
        ABBR_TO_FULL.put("고전", "고린도전서");    ABBR_TO_FULL.put("고후", "고린도후서");    ABBR_TO_FULL.put("갈", "갈라디아서");
        ABBR_TO_FULL.put("엡", "에베소서");       ABBR_TO_FULL.put("빌", "빌립보서");       ABBR_TO_FULL.put("골", "골로새서");
        ABBR_TO_FULL.put("살전", "데살로니가전서"); ABBR_TO_FULL.put("살후", "데살로니가후서"); ABBR_TO_FULL.put("딤전", "디모데전서");
        ABBR_TO_FULL.put("딤후", "디모데후서");    ABBR_TO_FULL.put("딛", "디도서");         ABBR_TO_FULL.put("몬", "빌레몬서");
        ABBR_TO_FULL.put("히", "히브리서");       ABBR_TO_FULL.put("약", "야고보서");       ABBR_TO_FULL.put("벧전", "베드로전서");
        ABBR_TO_FULL.put("벧후", "베드로후서");    ABBR_TO_FULL.put("요일", "요한일서");      ABBR_TO_FULL.put("요이", "요한이서");
        ABBR_TO_FULL.put("요삼", "요한삼서");      ABBR_TO_FULL.put("유", "유다서");         ABBR_TO_FULL.put("계", "요한계시록");
    }

    /** 약칭/정식명 → DB book 약칭 */
    private static final Map<String, String> ALIAS_TO_ABBR = new HashMap<>();
    static {
        ABBR_TO_FULL.forEach((abbr, full) -> {
            ALIAS_TO_ABBR.put(abbr, abbr);
            ALIAS_TO_ABBR.put(full, abbr);
        });
    }

    /** 입력 토큰(약칭/정식명) → DB book 약칭. 알 수 없으면 null. */
    static String resolveAbbr(String token) {
        if (token == null) return null;
        return ALIAS_TO_ABBR.get(token.trim());
    }

    /** 약칭 → 정식명(표시용). 없으면 입력 그대로. */
    static String fullName(String abbr) {
        return ABBR_TO_FULL.getOrDefault(abbr, abbr);
    }
}
