package com.example.locc.domain.notice.controller;

import com.example.locc.domain.notice.dto.request.NoticeRequest;
import com.example.locc.domain.notice.dto.request.NoticeSearchCondition;
import com.example.locc.domain.notice.dto.response.NoticeDetailResponse;
import com.example.locc.domain.notice.dto.response.NoticeResponse;
import com.example.locc.common.ApiResponse;
import com.example.locc.common.PageResponse;
import com.example.locc.domain.notice.service.NoticeCommandService;
import com.example.locc.domain.notice.service.NoticeQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * Notice API Controller
 * - 공개 API: 조회
 * - 관리자 API: 생성, 수정, 삭제, 고정 (ADMIN 권한 필요)
 */
@Slf4j
@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeApiController {

    private final NoticeCommandService noticeCommandService;
    private final NoticeQueryService noticeQueryService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<NoticeResponse>>> list(@ModelAttribute NoticeSearchCondition condition) {
        PageResponse<NoticeResponse> notices = PageResponse.from(noticeQueryService.findList(condition));
        return ResponseEntity.ok(ApiResponse.ok(notices));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NoticeDetailResponse>> detail(@PathVariable Long id) {
        NoticeDetailResponse notice = noticeQueryService.findDetail(id);
        return ResponseEntity.ok(ApiResponse.ok(notice));
    }

    @GetMapping("/pinned")
    public ResponseEntity<ApiResponse<List<NoticeResponse>>> pinned() {
        List<NoticeResponse> notices = noticeQueryService.findPinned();
        return ResponseEntity.ok(ApiResponse.ok(notices));
    }

    @PostMapping("/{id}/views")
    public ResponseEntity<ApiResponse<Void>> increaseViews(@PathVariable Long id) {
        noticeCommandService.increaseViews(id);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NoticeDetailResponse>> create(
            @Valid @ModelAttribute NoticeRequest request,
            Authentication authentication) {

        log.debug("공지사항 생성 요청: title={}", request.getTitle());
        NoticeDetailResponse response = noticeCommandService.create(request.toCreateCommand(authentication.getName()));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NoticeDetailResponse>> update(
            @PathVariable Long id,
            @Valid @ModelAttribute NoticeRequest request,
            Authentication authentication) {

        log.debug("공지사항 수정 요청: id={}", id);
        NoticeDetailResponse response = noticeCommandService.update(request.toUpdateCommand(id, authentication.getName()));
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/upload-image")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(
            @RequestParam("image") MultipartFile image,
            Authentication authentication) {

        log.debug("에디터 이미지 업로드: filename={}, size={}", image.getOriginalFilename(), image.getSize());
        String imageUrl = noticeCommandService.uploadContentImage(image, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(Map.of("url", imageUrl)));
    }

    @PatchMapping("/{id}/pin")
    public ResponseEntity<ApiResponse<Void>> togglePin(
            @PathVariable Long id,
            Authentication authentication) {

        log.debug("공지사항 고정 토글: id={}", id);
        noticeCommandService.togglePin(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            Authentication authentication) {

        log.debug("공지사항 삭제 요청: id={}", id);
        noticeCommandService.delete(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
