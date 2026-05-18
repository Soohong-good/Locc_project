package com.example.locc.domain.admin.service;

import com.example.locc.domain.admin.dto.internal.ContentSummaryItem;
import com.example.locc.domain.admin.dto.response.ContentSummaryResponse;
import com.example.locc.domain.department.service.DepartmentQueryService;
import com.example.locc.domain.gallery.service.GalleryImageQueryService;
import com.example.locc.domain.notice.service.NoticeQueryService;
import com.example.locc.domain.sermon.service.SermonQueryService;
import com.example.locc.domain.staff.service.StaffQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminContentQueryService {

    private final NoticeQueryService noticeQueryService;
    private final SermonQueryService sermonQueryService;
    private final StaffQueryService staffQueryService;
    private final GalleryImageQueryService galleryImageQueryService;
    private final DepartmentQueryService departmentQueryService;

    public ContentSummaryResponse getNoticeSummary() {
        log.debug("공지사항 요약 조회");

        List<ContentSummaryItem> recentItems = noticeQueryService.findLatestUnpinned(5)
                .stream()
                .map(n -> ContentSummaryItem.builder()
                        .id(n.getId())
                        .title(n.getTitle())
                        .author(n.getAuthorName())
                        .createdAt(n.getCreatedAt())
                        .viewCount(n.getViewCount() != null ? n.getViewCount().longValue() : null)
                        .detailUrl("/admin/notices/" + n.getId())
                        .build())
                .toList();

        return ContentSummaryResponse.of(
                "NOTICE", "공지사항",
                noticeQueryService.countAll(),
                noticeQueryService.countRecent(7),
                recentItems,
                "/admin/notices");
    }

    public ContentSummaryResponse getSermonSummary() {
        log.debug("설교 요약 조회");

        List<ContentSummaryItem> recentItems = sermonQueryService.findLatest(5)
                .stream()
                .map(s -> ContentSummaryItem.builder()
                        .id(s.getId())
                        .title(s.getTitle())
                        .author(s.getPreacher())
                        .createdAt(s.getCreatedAt())
                        .viewCount(null)
                        .detailUrl("/admin/sermons/" + s.getId())
                        .build())
                .toList();

        return ContentSummaryResponse.of(
                "SERMON", "설교",
                sermonQueryService.countAll(),
                sermonQueryService.countRecent(7),
                recentItems,
                "/admin/sermons");
    }

    public ContentSummaryResponse getStaffSummary() {
        log.debug("섬김이 요약 조회");

        List<ContentSummaryItem> recentItems = staffQueryService.findLatestForDashboard(5)
                .stream()
                .map(s -> ContentSummaryItem.builder()
                        .id(s.getId())
                        .title(s.getName())
                        .author(null)
                        .createdAt(s.getCreatedAt())
                        .viewCount(null)
                        .detailUrl("/admin/staff")
                        .build())
                .toList();

        return ContentSummaryResponse.of(
                "STAFF", "섬김이",
                staffQueryService.countAll(),
                0L,
                recentItems,
                "/admin/staff");
    }

    public ContentSummaryResponse getGallerySummary() {
        log.debug("갤러리 요약 조회");

        List<ContentSummaryItem> recentItems = galleryImageQueryService.getLatestGalleryForDashboard(0, 5)
                .getContent()
                .stream()
                .map(g -> ContentSummaryItem.builder()
                        .id(g.id())
                        .title(g.title() + " (" + g.departmentName() + ")")
                        .author(g.uploaderName())
                        .createdAt(g.createdAt())
                        .viewCount(null)
                        .detailUrl("/admin/gallery")
                        .build())
                .toList();

        return ContentSummaryResponse.of(
                "GALLERY", "갤러리",
                galleryImageQueryService.countAll(),
                0L,
                recentItems,
                "/admin/gallery");
    }

    public ContentSummaryResponse getDepartmentSummary() {
        log.debug("부서 요약 조회");

        return ContentSummaryResponse.of(
                "DEPARTMENT", "부서",
                departmentQueryService.countAll(),
                0L,
                Collections.emptyList(),
                "/admin/departments");
    }
}
