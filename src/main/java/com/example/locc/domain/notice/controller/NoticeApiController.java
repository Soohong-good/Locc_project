package com.example.locc.domain.notice.controller;

import com.example.locc.domain.notice.dto.command.NoticeCreateCommand;
import com.example.locc.domain.notice.dto.command.NoticeUpdateCommand;
import com.example.locc.domain.notice.dto.request.NoticeRequest;
import com.example.locc.domain.notice.dto.request.NoticeSearchCondition;
import com.example.locc.domain.notice.dto.response.NoticeDetailResponse;
import com.example.locc.domain.notice.dto.response.NoticeResponse;
import com.example.locc.domain.notice.service.NoticeCommandService;
import com.example.locc.domain.notice.service.NoticeQueryService;
import com.example.locc.domain.file.entity.File;
import com.example.locc.domain.file.service.FileCommandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
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
    private final FileCommandService fileCommandService;

    /**
     * 목록 조회
     */
    @GetMapping
    public ResponseEntity<Page<NoticeResponse>> list(@ModelAttribute NoticeSearchCondition condition) {
        Page<NoticeResponse> notices = noticeQueryService.findList(condition);
        return ResponseEntity.ok(notices);
    }

    /**
     * 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<NoticeDetailResponse> detail(@PathVariable Long id) {
        NoticeDetailResponse notice = noticeQueryService.findDetail(id);
        return ResponseEntity.ok(notice);
    }

    /**
     * 고정된 공지사항 조회
     */
    @GetMapping("/pinned")
    public ResponseEntity<List<NoticeResponse>> pinned() {
        List<NoticeResponse> notices = noticeQueryService.findPinned();
        return ResponseEntity.ok(notices);
    }

    /**
     * 조회수 증가
     */
    @PostMapping("/{id}/views")
    public ResponseEntity<Void> increaseViews(@PathVariable Long id) {
        noticeCommandService.increaseViews(id);
        return ResponseEntity.ok().build();
    }

    /**
     * 공지사항 생성 (관리자 전용)
     */
    @PostMapping
    public ResponseEntity<NoticeDetailResponse> create(
            @Valid @ModelAttribute NoticeRequest request,
            Authentication authentication) {
        
        log.info("공지사항 생성: title={}, user={}", request.getTitle(), authentication.getName());
        
        NoticeCreateCommand command = NoticeCreateCommand.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .files(request.getFiles())
                .createdByEmail(authentication.getName())
                .build();
        
        NoticeDetailResponse response = noticeCommandService.create(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 공지사항 수정 (관리자 전용)
     */
    @PutMapping("/{id}")
    public ResponseEntity<NoticeDetailResponse> update(
            @PathVariable Long id,
            @Valid @ModelAttribute NoticeRequest request,
            Authentication authentication) {
        
        log.info("공지사항 수정: id={}, user={}", id, authentication.getName());
        
        NoticeUpdateCommand command = NoticeUpdateCommand.builder()
                .noticeId(id)
                .title(request.getTitle())
                .content(request.getContent())
                .files(request.getFiles())
                .updatedByEmail(authentication.getName())
                .build();
        
        NoticeDetailResponse response = noticeCommandService.update(command);
        return ResponseEntity.ok(response);
    }

    /**
     * 이미지 업로드 (에디터용, 관리자 전용)
     */
    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("image") MultipartFile image,
            Authentication authentication) {
        
        log.debug("에디터 이미지 업로드: filename={}, size={}", 
                image.getOriginalFilename(), image.getSize());
        
        String imageUrl = fileCommandService.uploadContentImage(
                image,
                File.EntityType.NOTICE,
                authentication.getName()
        );
        
        return ResponseEntity.ok(Map.of("url", imageUrl));
    }

    /**
     * 고정 토글 (관리자 전용)
     */
    @PatchMapping("/{id}/pin")
    public ResponseEntity<Void> togglePin(
            @PathVariable Long id,
            Authentication authentication) {
        
        log.info("공지사항 고정 토글: id={}, user={}", id, authentication.getName());
        noticeCommandService.togglePin(id, authentication.getName());
        
        return ResponseEntity.noContent().build();
    }

    /**
     * 삭제 (관리자 전용)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication) {
        
        log.info("공지사항 삭제: id={}, user={}", id, authentication.getName());
        noticeCommandService.delete(id, authentication.getName());
        
        return ResponseEntity.noContent().build();
    }
}
