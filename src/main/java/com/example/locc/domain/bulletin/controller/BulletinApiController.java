package com.example.locc.domain.bulletin.controller;

import com.example.locc.domain.bulletin.dto.request.BulletinCreateRequest;
import com.example.locc.domain.bulletin.dto.request.BulletinUpdateRequest;
import com.example.locc.domain.bulletin.dto.response.BulletinDetailResponse;
import com.example.locc.domain.bulletin.dto.response.BulletinResponse;
import com.example.locc.domain.bulletin.service.BulletinCommandService;
import com.example.locc.domain.bulletin.service.BulletinQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

    /**
     * 주보 목록 조회 (공개)
     */
    @GetMapping
    public ResponseEntity<Page<BulletinResponse>> getBulletins(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {

        Pageable pageable = PageRequest.of(page, size);
        Page<BulletinResponse> bulletins;

        if (keyword != null && !keyword.isBlank()) {
            bulletins = bulletinQueryService.searchBulletins(keyword, pageable);
        } else {
            bulletins = bulletinQueryService.getBulletins(pageable);
        }

        return ResponseEntity.ok(bulletins);
    }

    /**
     * 주보 상세 조회 (공개)
     */
    @GetMapping("/{id}")
    public ResponseEntity<BulletinDetailResponse> getBulletinDetail(@PathVariable Long id) {
        BulletinDetailResponse bulletin = bulletinQueryService.getBulletinDetail(id);
        return ResponseEntity.ok(bulletin);
    }

    /**
     * 조회수 증가 (공개)
     */
    @PostMapping("/{id}/view")
    public ResponseEntity<Void> increaseViewCount(@PathVariable Long id) {
        bulletinCommandService.increaseViewCount(id);
        return ResponseEntity.ok().build();
    }

    /**
     * 주보 생성 (관리자 전용)
     */
    @PostMapping
    public ResponseEntity<BulletinDetailResponse> createBulletin(
            @Valid @ModelAttribute BulletinCreateRequest request,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail,
            Authentication authentication) {

        BulletinDetailResponse bulletin = bulletinCommandService.createBulletin(
                request.toCreateCommand(), thumbnail, authentication.getName());

        return ResponseEntity.ok(bulletin);
    }

    /**
     * 주보 수정 (관리자 전용)
     */
    @PutMapping("/{id}")
    public ResponseEntity<BulletinDetailResponse> updateBulletin(
            @PathVariable Long id,
            @Valid @RequestBody BulletinUpdateRequest request,
            Authentication authentication) {

        BulletinDetailResponse bulletin = bulletinCommandService.updateBulletin(
                id, request.toUpdateCommand(), authentication.getName());

        return ResponseEntity.ok(bulletin);
    }

    /**
     * 주보 삭제 (관리자 전용)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBulletin(
            @PathVariable Long id,
            Authentication authentication) {

        bulletinCommandService.deleteBulletin(id, authentication.getName());

        return ResponseEntity.noContent().build();
    }
}
