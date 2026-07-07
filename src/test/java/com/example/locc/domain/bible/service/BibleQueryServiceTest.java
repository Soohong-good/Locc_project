package com.example.locc.domain.bible.service;

import com.example.locc.domain.bible.dto.response.BiblePassageResponse;
import com.example.locc.domain.bible.entity.BibleVerse;
import com.example.locc.domain.bible.repository.BibleVerseRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;

/**
 * BibleQueryService 단위 테스트 (Mockito, DB 불필요)
 * - scripture 참조 문자열 파싱 로직(약칭/정식명, 구분자 정규화, 단절/구간/장 전체)을 중점 검증한다.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("BibleQueryService 단위 테스트")
class BibleQueryServiceTest {

    @Mock private BibleVerseRepository repository;

    @InjectMocks private BibleQueryService bibleQueryService;

    private BibleVerse verse(int v, String text) {
        BibleVerse bibleVerse = mock(BibleVerse.class);
        given(bibleVerse.getVerse()).willReturn(v);
        given(bibleVerse.getText()).willReturn(text);
        return bibleVerse;
    }

    @Test
    @DisplayName("참조가 null이면 null을 반환한다")
    void getPassage_nullRef() {
        assertThat(bibleQueryService.getPassage(null, "개역개정")).isNull();
    }

    @Test
    @DisplayName("책 이름을 알 수 없으면 null을 반환한다")
    void getPassage_unknownBook() {
        assertThat(bibleQueryService.getPassage("가나다9:1", "개역개정")).isNull();
    }

    @Test
    @DisplayName("장/절 형식이 아니면 null을 반환한다")
    void getPassage_invalidFormat() {
        assertThat(bibleQueryService.getPassage("고후", "개역개정")).isNull();
    }

    @Test
    @DisplayName("조회 결과가 없으면 null을 반환한다")
    void getPassage_notFound() {
        given(repository.findByBookAndChapterAndVerseBetweenOrderByVerseAsc("고후", 9, 1, 15))
                .willReturn(List.of());

        assertThat(bibleQueryService.getPassage("고린도후서9:1~15", "개역개정")).isNull();
    }

    @Test
    @DisplayName("정식명 + 물결표 구간(1~15) - 정식명을 약칭으로 변환해 구간 조회한다")
    void getPassage_fullNameTildeRange() {
        BibleVerse v1 = verse(1, "본문1");
        BibleVerse v15 = verse(15, "본문15");
        given(repository.findByBookAndChapterAndVerseBetweenOrderByVerseAsc("고후", 9, 1, 15))
                .willReturn(List.of(v1, v15));

        BiblePassageResponse response = bibleQueryService.getPassage("고린도후서9:1~15", "개역개정");

        assertThat(response.getBookName()).isEqualTo("고린도후서");
        assertThat(response.getReference()).isEqualTo("고린도후서 9:1-15");
        assertThat(response.getVerses()).hasSize(2);
    }

    @Test
    @DisplayName("약칭 + 대시 구간(고후 9:1-15) - 공백/대시도 정상 파싱된다")
    void getPassage_abbrDashRange() {
        BibleVerse v1 = verse(1, "본문1");
        BibleVerse v15 = verse(15, "본문15");
        given(repository.findByBookAndChapterAndVerseBetweenOrderByVerseAsc("고후", 9, 1, 15))
                .willReturn(List.of(v1, v15));

        BiblePassageResponse response = bibleQueryService.getPassage("고후 9:1-15", "개역개정");

        assertThat(response.getReference()).isEqualTo("고린도후서 9:1-15");
    }

    @Test
    @DisplayName("단일 절(요한복음3:16) - startVerse=endVerse로 단절 조회한다")
    void getPassage_singleVerse() {
        BibleVerse v16 = verse(16, "하나님이 세상을 이처럼 사랑하사");
        given(repository.findByBookAndChapterAndVerseBetweenOrderByVerseAsc("요", 3, 16, 16))
                .willReturn(List.of(v16));

        BiblePassageResponse response = bibleQueryService.getPassage("요한복음3:16", "개역개정");

        assertThat(response.getReference()).isEqualTo("요한복음 3:16");
        assertThat(response.getStartVerse()).isEqualTo(16);
        assertThat(response.getEndVerse()).isEqualTo(16);
    }

    @Test
    @DisplayName("장 전체(고후 9장) - 절 지정 없이 장 전체를 조회한다")
    void getPassage_wholeChapter() {
        BibleVerse v1 = verse(1, "본문1");
        BibleVerse v2 = verse(2, "본문2");
        given(repository.findByBookAndChapterOrderByVerseAsc("고후", 9))
                .willReturn(List.of(v1, v2));

        BiblePassageResponse response = bibleQueryService.getPassage("고후9장", "개역개정");

        assertThat(response.getReference()).isEqualTo("고린도후서 9장");
    }

    @Test
    @DisplayName("전각 콜론과 물결표 변형(：, 〜)도 정규화되어 파싱된다")
    void getPassage_fullWidthAndUnicodeVariants() {
        BibleVerse v22 = verse(22, "본문22");
        BibleVerse v31 = verse(31, "본문31");
        given(repository.findByBookAndChapterAndVerseBetweenOrderByVerseAsc("겔", 36, 22, 31))
                .willReturn(List.of(v22, v31));

        BiblePassageResponse response = bibleQueryService.getPassage("겔36：22〜31", "개역개정");

        assertThat(response.getReference()).isEqualTo("에스겔 36:22-31");
    }
}
