package com.example.locc.domain.bible.service;

import com.example.locc.domain.bible.dto.response.BiblePassageResponse;
import com.example.locc.domain.bible.entity.BibleVerse;
import com.example.locc.domain.bible.repository.BibleVerseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * 성경 본문 조회 서비스
 * - scripture 참조("고린도후서9:1~15" / "고후 9:1-15" / "요한복음3:16" / "고후 9장")를 파싱해
 *   기존 bible_verse 테이블(book 약칭)에서 구간 절을 조회.
 * - 파싱 실패/미존재 시 null (컨트롤러 data=null → 프론트 섹션 숨김).
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BibleQueryService {

    private static final String VERSION_LABEL = "개역개정";

    // "9:1-15" / "9:1~15" / "9:1" (+ 선택 '절')
    private static final Pattern CV_RANGE = Pattern.compile("^(\\d+):(\\d+)(?:[~\\-](\\d+))?절?$");
    // "9장" / "9"
    private static final Pattern CHAPTER_ONLY = Pattern.compile("^(\\d+)장?$");

    private final BibleVerseRepository repository;

    public BiblePassageResponse getPassage(String ref, String version) {
        Parsed p = parse(ref);
        if (p == null) return null;

        List<BibleVerse> rows = (p.startVerse == null)
                ? repository.findByBookAndChapterOrderByVerseAsc(p.bookAbbr, p.chapter)
                : repository.findByBookAndChapterAndVerseBetweenOrderByVerseAsc(
                        p.bookAbbr, p.chapter, p.startVerse,
                        p.endVerse == null ? p.startVerse : p.endVerse);

        if (rows.isEmpty()) return null;

        List<BiblePassageResponse.Verse> verses = rows.stream()
                .map(v -> BiblePassageResponse.Verse.builder().verse(v.getVerse()).text(v.getText()).build())
                .collect(Collectors.toList());

        int first = rows.get(0).getVerse();
        int last = rows.get(rows.size() - 1).getVerse();
        String full = BibleBooks.fullName(p.bookAbbr);

        return BiblePassageResponse.builder()
                .version(VERSION_LABEL)
                .bookName(full)
                .chapter(p.chapter)
                .startVerse(first)
                .endVerse(last)
                .reference(buildReference(full, p.chapter, first, last, p.startVerse == null))
                .verses(verses)
                .build();
    }

    private String buildReference(String book, int chapter, int first, int last, boolean wholeChapter) {
        if (wholeChapter) return String.format("%s %d장", book, chapter);
        if (first == last) return String.format("%s %d:%d", book, chapter, first);
        return String.format("%s %d:%d-%d", book, chapter, first, last);
    }

    /** scripture 참조 파싱 → book 약칭 + 장/절 */
    private Parsed parse(String ref) {
        if (ref == null) return null;
        String s = ref.replaceAll("\\s+", "")
                .replace('～', '~').replace('〜', '~').replace('∼', '~')
                .replace('–', '-').replace('—', '-').replace('−', '-')
                .replace('：', ':');
        if (s.isEmpty()) return null;

        // 책 토큰 = 선행 비숫자
        int i = 0;
        while (i < s.length() && !Character.isDigit(s.charAt(i))) i++;
        if (i == 0 || i == s.length()) return null;
        String bookAbbr = BibleBooks.resolveAbbr(s.substring(0, i));
        if (bookAbbr == null) return null;
        String rest = s.substring(i);

        Matcher m = CV_RANGE.matcher(rest);
        if (m.matches()) {
            int ch = Integer.parseInt(m.group(1));
            int vs = Integer.parseInt(m.group(2));
            Integer ve = m.group(3) != null ? Integer.parseInt(m.group(3)) : null;
            return new Parsed(bookAbbr, ch, vs, ve);
        }
        m = CHAPTER_ONLY.matcher(rest);
        if (m.matches()) {
            return new Parsed(bookAbbr, Integer.parseInt(m.group(1)), null, null);
        }
        return null;
    }

    private static final class Parsed {
        final String bookAbbr;
        final int chapter;
        final Integer startVerse; // null = 장 전체
        final Integer endVerse;   // null = 단절 또는 장 전체

        Parsed(String bookAbbr, int chapter, Integer startVerse, Integer endVerse) {
            this.bookAbbr = bookAbbr;
            this.chapter = chapter;
            this.startVerse = startVerse;
            this.endVerse = endVerse;
        }
    }
}
