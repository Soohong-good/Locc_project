package com.example.locc.domain.bulletin.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.common.PageResponse;
import com.example.locc.domain.bulletin.dto.request.BulletinCreateRequest;
import com.example.locc.domain.bulletin.dto.request.BulletinUpdateRequest;
import com.example.locc.domain.bulletin.dto.response.BulletinDetailResponse;
import com.example.locc.domain.bulletin.dto.response.BulletinResponse;
import com.example.locc.domain.bulletin.service.BulletinCommandService;
import com.example.locc.domain.bulletin.service.BulletinQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Bulletin ApiController
 * - REST API 전용
 * - 생성/수정/삭제는 관리자만 가능
 */
@Slf4j
@RestController
@RequestMapping("/api/bulletin")
@RequiredArgsConstructor
public class BulletinApiController {

    private final BulletinCommandService bulletinCommandService;
    private final BulletinQueryService bulletinQueryService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<BulletinResponse>>> getBulletins(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.ok(
                PageResponse.from(bulletinQueryService.getList(keyword, pageable))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BulletinDetailResponse>> getBulletinDetail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(bulletinQueryService.getBulletinDetail(id)));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<ApiResponse<Void>> increaseViewCount(@PathVariable Long id) {
        bulletinCommandService.increaseViewCount(id);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BulletinDetailResponse>> createBulletin(
            @Valid @ModelAttribute BulletinCreateRequest request,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail,
            Authentication authentication) {

        BulletinDetailResponse bulletin = bulletinCommandService.createBulletin(
                request.toCreateCommand(), thumbnail, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(bulletin));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BulletinDetailResponse>> updateBulletin(
            @PathVariable Long id,
            @Valid @ModelAttribute BulletinUpdateRequest request,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail,
            Authentication authentication) {

        BulletinDetailResponse bulletin = bulletinCommandService.updateBulletin(
                id, request.toUpdateCommand(), thumbnail, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(bulletin));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBulletin(
            @PathVariable Long id,
            Authentication authentication) {

        bulletinCommandService.deleteBulletin(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
