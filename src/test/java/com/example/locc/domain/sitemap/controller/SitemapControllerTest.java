package com.example.locc.domain.sitemap.controller;

import com.example.locc.domain.gallery.service.GalleryImageQueryService;
import com.example.locc.domain.notice.dto.response.NoticeResponse;
import com.example.locc.domain.notice.service.NoticeQueryService;
import com.example.locc.domain.praisesheet.service.PraiseSheetQueryService;
import com.example.locc.domain.sermon.dto.response.SermonResponse;
import com.example.locc.domain.sermon.service.SermonQueryService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.BDDMockito.given;

/**
 * SitemapController 단위 테스트 (Mockito, DB 불필요)
 * - 정적 페이지 URL 포함 여부, 주일오전 날짜 그룹화, 동적 콘텐츠 URL 조립을 검증한다.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("SitemapController 단위 테스트")
class SitemapControllerTest {

    @Mock private SermonQueryService sermonQueryService;
    @Mock private NoticeQueryService noticeQueryService;
    @Mock private PraiseSheetQueryService praiseSheetQueryService;
    @Mock private GalleryImageQueryService galleryImageQueryService;

    @InjectMocks private SitemapController sitemapController;

    @Test
    @DisplayName("정적 페이지 URL이 모두 포함된다")
    void getSitemap_includesStaticPages() {
        given(sermonQueryService.findPagedForAdmin(anyInt(), anyInt())).willReturn(Page.empty());
        given(noticeQueryService.findList(any())).willReturn(Page.empty());
        given(praiseSheetQueryService.findList(any())).willReturn(Page.empty());
        given(galleryImageQueryService.getImageListForBoardAll(any(), anyInt())).willReturn(Page.empty());

        String xml = sitemapController.getSitemap();

        assertThat(xml).contains("<loc>https://locc.kr/</loc>");
        assertThat(xml).contains("<loc>https://locc.kr/worship/sermon/sunday-morning</loc>");
        assertThat(xml).contains("<loc>https://locc.kr/department/gallery</loc>");
        assertThat(xml).contains("<loc>https://locc.kr/department/nursery</loc>");
    }

    @Test
    @DisplayName("주일오전 설교는 날짜 단위로 그룹화되고, 그 외 카테고리는 id로 개별 URL이 생성된다")
    void getSitemap_groupsSundayMorningByDate_andListsOthersById() {
        SermonResponse sundayMorning1 = SermonResponse.builder()
                .id(1L).category("주일오전").sermonDate(LocalDate.of(2026, 6, 28))
                .createdAt(LocalDateTime.now()).isNew(false).build();
        SermonResponse sundayMorning2 = SermonResponse.builder()
                .id(2L).category("주일오전").sermonDate(LocalDate.of(2026, 6, 28))
                .createdAt(LocalDateTime.now()).isNew(false).build();
        SermonResponse weekday = SermonResponse.builder()
                .id(3L).category("수요예배").sermonDate(LocalDate.of(2026, 6, 24))
                .createdAt(LocalDateTime.now()).isNew(false).build();

        given(sermonQueryService.findPagedForAdmin(anyInt(), anyInt()))
                .willReturn(new PageImpl<>(List.of(sundayMorning1, sundayMorning2, weekday)));
        given(noticeQueryService.findList(any())).willReturn(Page.empty());
        given(praiseSheetQueryService.findList(any())).willReturn(Page.empty());
        given(galleryImageQueryService.getImageListForBoardAll(any(), anyInt())).willReturn(Page.empty());

        String xml = sitemapController.getSitemap();

        // 같은 날짜의 주일오전 1·2부는 하나의 날짜 URL로 합쳐진다
        assertThat(xml).contains("<loc>https://locc.kr/worship/sermon/sunday-morning/2026-06-28</loc>");
        assertThat(countOccurrences(xml, "sunday-morning/2026-06-28")).isEqualTo(1);
        // 그 외 카테고리는 개별 설교 id로 상세 URL이 생성된다
        assertThat(xml).contains("<loc>https://locc.kr/worship/sermon/3</loc>");
    }

    @Test
    @DisplayName("공지사항은 id 기반 상세 URL과 lastmod를 포함한다")
    void getSitemap_includesNoticesWithLastmod() {
        NoticeResponse notice = NoticeResponse.builder()
                .id(10L).createdAt(LocalDateTime.of(2026, 5, 1, 0, 0)).isNew(false).build();

        given(sermonQueryService.findPagedForAdmin(anyInt(), anyInt())).willReturn(Page.empty());
        given(noticeQueryService.findList(any())).willReturn(new PageImpl<>(List.of(notice)));
        given(praiseSheetQueryService.findList(any())).willReturn(Page.empty());
        given(galleryImageQueryService.getImageListForBoardAll(any(), anyInt())).willReturn(Page.empty());

        String xml = sitemapController.getSitemap();

        assertThat(xml).contains("<loc>https://locc.kr/notices/10</loc>");
        assertThat(xml).contains("<lastmod>2026-05-01</lastmod>");
    }

    private long countOccurrences(String text, String substring) {
        return text.split(substring, -1).length - 1L;
    }
}
