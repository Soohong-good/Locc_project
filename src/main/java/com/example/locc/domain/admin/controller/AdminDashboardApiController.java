package com.example.locc.domain.admin.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.common.PageResponse;
import com.example.locc.domain.admin.dto.response.DashboardResponse;
import com.example.locc.domain.admin.service.AdminDashboardQueryService;
import com.example.locc.domain.gallery.service.GalleryImageQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 관리자 대시보드 API
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminDashboardApiController {

    private final AdminDashboardQueryService dashboardQueryService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        log.info("관리자 대시보드 API 조회");
        return ResponseEntity.ok(ApiResponse.ok(dashboardQueryService.getDashboard()));
    }

    /**
     * 대시보드 전체 최신 갤러리 목록
     */
    @GetMapping("/recent-gallery")
    public ResponseEntity<ApiResponse<PageResponse<GalleryImageQueryService.GalleryDashboardResponse>>> getRecentGallery(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardQueryService.getRecentGallery(page, size)));
    }
}
