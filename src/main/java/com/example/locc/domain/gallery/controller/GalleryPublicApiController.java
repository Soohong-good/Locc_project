package com.example.locc.domain.gallery.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.common.PageResponse;
import com.example.locc.domain.gallery.service.GalleryImageQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/galleries")
@RequiredArgsConstructor
public class GalleryPublicApiController {

    private final GalleryImageQueryService queryService;

    /** 전체 부서 최신 갤러리 이미지 (홈페이지용, 비로그인 허용) */
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<PageResponse<GalleryImageQueryService.GalleryDashboardResponse>>> getRecentGallery(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Page<GalleryImageQueryService.GalleryDashboardResponse> result =
                queryService.getLatestGalleryForDashboard(page, size);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(result)));
    }
}
