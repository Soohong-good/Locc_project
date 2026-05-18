package com.example.locc.domain.sermon.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.common.PageResponse;
import com.example.locc.domain.sermon.dto.request.SermonRequest;
import com.example.locc.domain.sermon.dto.request.SermonSearchCondition;
import com.example.locc.domain.sermon.dto.response.SermonDetailResponse;
import com.example.locc.domain.sermon.dto.response.SermonPageResponse;
import com.example.locc.domain.sermon.dto.response.SermonResponse;
import com.example.locc.domain.sermon.service.SermonCommandService;
import com.example.locc.domain.sermon.service.SermonQueryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * Sermon API Controller
 * - 공개 API: 조회
 * - 관리자 API: 생성, 수정, 삭제 (ADMIN 권한 필요)
 */
@Slf4j
@Validated
@RestController
@RequestMapping("/api/sermons")
@RequiredArgsConstructor
public class SermonApiController {

    private final SermonQueryService sermonQueryService;
    private final SermonCommandService sermonCommandService;

    // ─────────────────────────────────────────────
    // 공개 조회 API
    // ─────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<SermonResponse>>> list(
            @ModelAttribute SermonSearchCondition condition) {
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(sermonQueryService.findList(condition))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SermonDetailResponse>> detail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(sermonQueryService.findDetail(id)));
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<List<SermonResponse>>> latest(
            @Max(50) @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(ApiResponse.ok(sermonQueryService.findLatest(limit)));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<PageResponse<SermonResponse>>> listByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        SermonSearchCondition condition = SermonSearchCondition.builder()
                .category(category).page(page).size(size).build();
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(sermonQueryService.findList(condition))));
    }

    @GetMapping("/category/{category}/latest")
    public ResponseEntity<ApiResponse<SermonResponse>> latestByCategory(@PathVariable String category) {
        return ResponseEntity.ok(ApiResponse.ok(sermonQueryService.findLatestOneByCategory(category)));
    }

    // ─────────────────────────────────────────────
    // 페이지 전용 통합 조회 API (React SPA용)
    // ─────────────────────────────────────────────

    @GetMapping("/sunday-morning/{serviceNumber}")
    public ResponseEntity<ApiResponse<SermonPageResponse>> getSundayMorningData(
            @PathVariable Integer serviceNumber,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                sermonQueryService.getSundayMorningPage(serviceNumber, page, size)));
    }

    @GetMapping("/sunday-afternoon")
    public ResponseEntity<ApiResponse<SermonPageResponse>> getSundayAfternoonData(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                sermonQueryService.getSundayAfternoonPage(page, size)));
    }

    @GetMapping("/weekday/{type}")
    public ResponseEntity<ApiResponse<SermonPageResponse>> getWeekdayData(
            @PathVariable String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                sermonQueryService.getWeekdayPage(type, page, size)));
    }

    @GetMapping("/training-message")
    public ResponseEntity<ApiResponse<SermonPageResponse>> getTrainingMessageData(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                sermonQueryService.getTrainingMessagePage(page, size)));
    }

    // ─────────────────────────────────────────────
    // 관리자 CRUD API
    // ─────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<ApiResponse<SermonDetailResponse>> create(
            @Valid @ModelAttribute SermonRequest request,
            Authentication authentication) {
        log.debug("설교 생성 요청: title={}", request.getTitle());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(sermonCommandService.create(
                        request.toCreateCommand(authentication.getName()))));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SermonDetailResponse>> update(
            @PathVariable Long id,
            @Valid @ModelAttribute SermonRequest request,
            Authentication authentication) {
        log.debug("설교 수정 요청: id={}", id);
        return ResponseEntity.ok(ApiResponse.ok(sermonCommandService.update(
                request.toUpdateCommand(id, authentication.getName()))));
    }

    @PostMapping("/upload-image")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(
            @RequestParam("image") MultipartFile image,
            Authentication authentication) {
        log.debug("에디터 이미지 업로드: filename={}, size={}", image.getOriginalFilename(), image.getSize());
        String imageUrl = sermonCommandService.uploadContentImage(image, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(Map.of("url", imageUrl)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id, Authentication authentication) {
        log.debug("설교 삭제 요청: id={}", id);
        sermonCommandService.delete(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
