package com.example.locc.domain.sitemap.controller;

import com.example.locc.domain.gallery.dto.response.GalleryImageResponse;
import com.example.locc.domain.gallery.service.GalleryImageQueryService;
import com.example.locc.domain.notice.dto.request.NoticeSearchCondition;
import com.example.locc.domain.notice.dto.response.NoticeResponse;
import com.example.locc.domain.notice.service.NoticeQueryService;
import com.example.locc.domain.praisesheet.dto.request.PraiseSheetSearchCondition;
import com.example.locc.domain.praisesheet.dto.response.PraiseSheetResponse;
import com.example.locc.domain.praisesheet.service.PraiseSheetQueryService;
import com.example.locc.domain.sermon.dto.response.SermonResponse;
import com.example.locc.domain.sermon.service.SermonQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * 구글/네이버 색인용 sitemap.xml 동적 생성.
 *
 * <p>React SPA + Nginx SPA-fallback 구조에서는 존재하지 않는 URL도 200 OK를 반환해
 * 검색엔진이 Soft 404로 오인하는 문제가 있다. 실제 존재하는 URL 목록을 sitemap으로
 * 명시적으로 제공해 검색엔진이 유효한 페이지 위주로 크롤링하도록 유도한다.
 *
 * <p>로그인 필요 페이지(훈련신청·주보·시설신청 등)와 관리자 페이지는 검색 노출 대상이
 * 아니므로 제외한다. 도메인별 최근 항목은 500건(갤러리는 페이지당 12건 × 4페이지)으로
 * 제한해 응답 크기를 적정 수준으로 유지한다.
 */
@RestController
@RequiredArgsConstructor
public class SitemapController {

    private static final String BASE_URL = "https://locc.kr";
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final int DYNAMIC_LIST_SIZE = 500;
    private static final int GALLERY_PAGES = 4; // 페이지당 12건 고정

    private static final List<String> DEPARTMENT_CODES = List.of(
            "nursery", "preschool", "children", "youth",
            "young-adults", "newcomers", "multiethnic", "healing"
    );

    private final SermonQueryService sermonQueryService;
    private final NoticeQueryService noticeQueryService;
    private final PraiseSheetQueryService praiseSheetQueryService;
    private final GalleryImageQueryService galleryImageQueryService;

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String getSitemap() {
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        appendStaticPages(xml);
        appendSermons(xml);
        appendNotices(xml);
        appendPraiseSheets(xml);
        appendGallery(xml);

        xml.append("</urlset>");
        return xml.toString();
    }

    private void appendStaticPages(StringBuilder xml) {
        addUrl(xml, "/", "1.0", null);
        addUrl(xml, "/salvation", "0.8", null);
        addUrl(xml, "/church/about", "0.6", null);
        addUrl(xml, "/church/confession", "0.6", null);
        addUrl(xml, "/church/staff", "0.6", null);
        addUrl(xml, "/church/first-visit", "0.6", null);
        addUrl(xml, "/church/mission", "0.6", null);
        addUrl(xml, "/church/contact", "0.6", null);
        addUrl(xml, "/church/worship-guide", "0.6", null);
        addUrl(xml, "/worship/newyear", "0.7", null);
        addUrl(xml, "/worship/sermon/sunday-morning", "0.9", null);
        addUrl(xml, "/worship/sermon/sunday-afternoon", "0.8", null);
        addUrl(xml, "/worship/sermon/weekday", "0.8", null);
        addUrl(xml, "/worship/sermon/training-message", "0.7", null);
        addUrl(xml, "/worship/training-intro", "0.6", null);
        addUrl(xml, "/notices", "0.8", null);
        addUrl(xml, "/praise-sheets", "0.6", null);
        addUrl(xml, "/praise/choir", "0.6", null);
        addUrl(xml, "/department/gallery", "0.6", null);
        for (String code : DEPARTMENT_CODES) {
            addUrl(xml, "/department/" + code, "0.5", null);
        }
    }

    /**
     * 주일오전은 날짜 단위 통합 상세(/worship/sermon/sunday-morning/{date})라
     * 카테고리별로 분기하고, 주일오전은 날짜를 중복 제거해서 넣는다.
     */
    private void appendSermons(StringBuilder xml) {
        Page<SermonResponse> sermons = sermonQueryService.findPagedForAdmin(0, DYNAMIC_LIST_SIZE);
        Set<String> sundayMorningDates = new LinkedHashSet<>();

        for (SermonResponse sermon : sermons.getContent()) {
            if ("주일오전".equals(sermon.getCategory())) {
                sundayMorningDates.add(sermon.getSermonDate().format(DATE_FMT));
            } else {
                addUrl(xml, "/worship/sermon/" + sermon.getId(), "0.6", sermon.getCreatedAt());
            }
        }
        for (String date : sundayMorningDates) {
            addUrl(xml, "/worship/sermon/sunday-morning/" + date, "0.6", null);
        }
    }

    private void appendNotices(StringBuilder xml) {
        NoticeSearchCondition condition = NoticeSearchCondition.builder().size(DYNAMIC_LIST_SIZE).build();
        for (NoticeResponse notice : noticeQueryService.findList(condition).getContent()) {
            addUrl(xml, "/notices/" + notice.getId(), "0.5", notice.getCreatedAt());
        }
    }

    private void appendPraiseSheets(StringBuilder xml) {
        PraiseSheetSearchCondition condition = PraiseSheetSearchCondition.builder().size(DYNAMIC_LIST_SIZE).build();
        for (PraiseSheetResponse sheet : praiseSheetQueryService.findList(condition).getContent()) {
            addUrl(xml, "/praise-sheets/" + sheet.getId(), "0.4", sheet.getCreatedAt());
        }
    }

    private void appendGallery(StringBuilder xml) {
        for (int page = 0; page < GALLERY_PAGES; page++) {
            Page<GalleryImageResponse> images = galleryImageQueryService.getImageListForBoardAll(null, page);
            for (GalleryImageResponse image : images.getContent()) {
                addUrl(xml, "/department/gallery/" + image.id(), "0.4", image.createdAt());
            }
            if (images.isLast()) break;
        }
    }

    private void addUrl(StringBuilder xml, String path, String priority, LocalDateTime lastmod) {
        xml.append("  <url>\n");
        xml.append("    <loc>").append(BASE_URL).append(path).append("</loc>\n");
        if (lastmod != null) {
            xml.append("    <lastmod>").append(lastmod.toLocalDate().format(DATE_FMT)).append("</lastmod>\n");
        }
        xml.append("    <priority>").append(priority).append("</priority>\n");
        xml.append("  </url>\n");
    }
}
