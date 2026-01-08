package com.example.locc.domain.gallery.controller;

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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
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

    /**
     * 인스타그램 스타일: 갤러리 그룹 목록 조회 (페이징)
     * GET /api/departments/{departmentCode}/gallery/groups?page=0&size=12
     */
    @GetMapping("/groups")
    public ResponseEntity<Page<GalleryGroupResponse>> getGalleryGroups(
            @PathVariable String departmentCode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<GalleryGroupResponse> galleryGroups = queryService.getGalleryGroups(departmentCode, pageable);
        return ResponseEntity.ok(galleryGroups);
    }

    /**
     * 특정 제목의 모든 이미지 조회 (라이트박스용)
     * GET /api/departments/{departmentCode}/gallery/titles/{title}/images
     */
    @GetMapping("/titles/{title}/images")
    public ResponseEntity<List<GalleryImageResponse>> getImagesByTitle(
            @PathVariable String departmentCode,
            @PathVariable String title
    ) {
        List<GalleryImageResponse> images = queryService.getImagesByTitle(departmentCode, title);
        return ResponseEntity.ok(images);
    }

    /**
     * 갤러리 이미지 목록 조회 (무한 스크롤)
     * GET /api/departments/{departmentCode}/gallery?page=0&size=12&groupName=2024여름수련회
     */
    @GetMapping
    public ResponseEntity<Slice<GalleryImageResponse>> getImageList(
            @PathVariable String departmentCode,
            @RequestParam(required = false) String groupName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        GalleryImageSearchCondition condition = new GalleryImageSearchCondition(
                departmentCode,
                groupName,
                page,
                size
        );

        Slice<GalleryImageResponse> images = queryService.getImageList(condition);
        return ResponseEntity.ok(images);
    }

    /**
     * 갤러리 이미지 상세 조회
     * GET /api/departments/{departmentCode}/gallery/{imageId}
     */
    @GetMapping("/{imageId}")
    public ResponseEntity<GalleryImageDetailResponse> getImageDetail(
            @PathVariable String departmentCode,
            @PathVariable Long imageId
    ) {
        // 조회수 증가
        commandService.incrementViewCount(imageId);

        GalleryImageDetailResponse response = queryService.getImageDetail(imageId);
        return ResponseEntity.ok(response);
    }

    /**
     * 제목 목록 조회
     * GET /api/departments/{departmentCode}/gallery/titles
     */
    @GetMapping("/titles")
    public ResponseEntity<List<String>> getTitles(@PathVariable String departmentCode) {
        List<String> titles = queryService.getTitles(departmentCode);
        return ResponseEntity.ok(titles);
    }

    /**
     * 갤러리 이미지 업로드 (다중)
     * POST /api/departments/{departmentCode}/gallery
     */
    @PostMapping
    public ResponseEntity<List<GalleryImageDetailResponse>> uploadImages(
            @PathVariable String departmentCode,
            @Valid @ModelAttribute GalleryImageRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.debug("갤러리 업로드 요청 - 부서: {}, 제목: {}, 파일 개수: {}", 
                departmentCode, request.title(), 
                request.imageFiles() != null ? request.imageFiles().size() : 0);
        
        List<GalleryImageDetailResponse> responses = commandService.uploadImages(
                request.toCreateCommands(departmentCode),
                userDetails.getUsername()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(responses);
    }

    /**
     * 갤러리 이미지 삭제
     * DELETE /api/departments/{departmentCode}/gallery/{imageId}
     */
    @DeleteMapping("/{imageId}")
    public ResponseEntity<Void> deleteImage(
            @PathVariable String departmentCode,
            @PathVariable Long imageId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        commandService.deleteImage(imageId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
