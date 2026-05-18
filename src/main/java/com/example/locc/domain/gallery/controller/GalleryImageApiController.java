package com.example.locc.domain.gallery.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.common.PageResponse;
import com.example.locc.domain.gallery.dto.request.GalleryImageRequest;
import com.example.locc.domain.gallery.dto.request.GalleryImageSearchCondition;
import com.example.locc.domain.gallery.dto.response.GalleryGroupResponse;
import com.example.locc.domain.gallery.dto.response.GalleryImageDetailResponse;
import com.example.locc.domain.gallery.dto.response.GalleryImageResponse;
import com.example.locc.domain.gallery.service.GalleryImageCommandService;
import com.example.locc.domain.gallery.service.GalleryImageQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/departments/{departmentCode}/gallery")
@RequiredArgsConstructor
public class GalleryImageApiController {

    private final GalleryImageCommandService commandService;
    private final GalleryImageQueryService queryService;

    @GetMapping("/groups")
    public ResponseEntity<ApiResponse<PageResponse<GalleryGroupResponse>>> getGalleryGroups(
            @PathVariable String departmentCode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(queryService.getGalleryGroups(departmentCode, pageable))));
    }

    @GetMapping("/titles/{title}/images")
    public ResponseEntity<ApiResponse<List<GalleryImageResponse>>> getImagesByTitle(
            @PathVariable String departmentCode,
            @PathVariable String title) {
        return ResponseEntity.ok(ApiResponse.ok(queryService.getImagesByTitle(departmentCode, title)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<GalleryImageResponse>>> getImageListForBoard(
            @PathVariable String departmentCode,
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(queryService.getImageListForBoard(departmentCode, page))));
    }

    @GetMapping("/{imageId}")
    public ResponseEntity<ApiResponse<GalleryImageDetailResponse>> getImageDetail(
            @PathVariable String departmentCode,
            @PathVariable Long imageId) {
        return ResponseEntity.ok(ApiResponse.ok(commandService.incrementViewCountAndGet(imageId)));
    }

    @GetMapping("/titles")
    public ResponseEntity<ApiResponse<List<String>>> getTitles(@PathVariable String departmentCode) {
        return ResponseEntity.ok(ApiResponse.ok(queryService.getTitles(departmentCode)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<List<GalleryImageDetailResponse>>> uploadImages(
            @PathVariable String departmentCode,
            @Valid @ModelAttribute GalleryImageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.debug("갤러리 업로드 요청 - 부서: {}, 제목: {}, 파일 개수: {}",
                departmentCode, request.title(),
                request.imageFiles() != null ? request.imageFiles().size() : 0);

        List<GalleryImageDetailResponse> responses = commandService.uploadImages(
                request.toCreateCommands(departmentCode), userDetails.getUsername());

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(responses));
    }

    @DeleteMapping("/{imageId}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @PathVariable String departmentCode,
            @PathVariable Long imageId,
            @AuthenticationPrincipal UserDetails userDetails) {
        commandService.deleteImage(imageId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
