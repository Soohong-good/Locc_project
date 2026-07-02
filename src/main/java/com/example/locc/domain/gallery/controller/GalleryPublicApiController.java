package com.example.locc.domain.gallery.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.common.PageResponse;
import com.example.locc.domain.gallery.dto.response.GalleryImageDetailResponse;
import com.example.locc.domain.gallery.dto.response.GalleryImageResponse;
import com.example.locc.domain.gallery.service.GalleryImageCommandService;
import com.example.locc.domain.gallery.service.GalleryImageQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/galleries")
@RequiredArgsConstructor
public class GalleryPublicApiController {

    private final GalleryImageQueryService queryService;
    private final GalleryImageCommandService commandService;

    /**
     * 전체 부서 최신 이미지 (홈페이지 갤러리용, 비로그인 허용)
     * 그룹 구분 없이 최근 업로드 순으로 개별 이미지 반환
     */
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<PageResponse<GalleryImageQueryService.GalleryDashboardResponse>>> getRecentGallery(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Page<GalleryImageQueryService.GalleryDashboardResponse> result =
                queryService.getLatestImagesForMain(page, size);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(result)));
    }

    /**
     * 부서 통합 갤러리 목록 (게시판 형식) — departmentCode 없으면 전체, 있으면 해당 부서만
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<GalleryImageResponse>>> getGalleryList(
            @RequestParam(required = false) String departmentCode,
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(queryService.getImageListForBoardAll(departmentCode, page))));
    }

    /**
     * 갤러리 이미지 상세 (부서 코드 불필요, 조회수 증가 포함)
     */
    @GetMapping("/{imageId}")
    public ResponseEntity<ApiResponse<GalleryImageDetailResponse>> getImageDetail(@PathVariable Long imageId) {
        return ResponseEntity.ok(ApiResponse.ok(commandService.incrementViewCountAndGet(imageId)));
    }

    /**
     * 같은 업로드 그룹의 전체 이미지 (라이트박스/그룹 뷰용, 부서 코드 불필요)
     */
    @GetMapping("/{imageId}/group")
    public ResponseEntity<ApiResponse<List<GalleryImageResponse>>> getGroupImages(@PathVariable Long imageId) {
        return ResponseEntity.ok(ApiResponse.ok(queryService.getGroupImagesByImageId(imageId)));
    }
}
