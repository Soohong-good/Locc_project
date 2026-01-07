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
 * - 요청/응답 처리만 담당
 * - 비즈니스 로직은 Service에 위임
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
     * 생성
     */
    @PostMapping
    public ResponseEntity<NoticeDetailResponse> create(
            @Valid @ModelAttribute NoticeRequest request,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            Authentication authentication) {

        NoticeCreateCommand command = NoticeCreateCommand.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .isPinned(request.getIsPinned())
                .createdByEmail(authentication.getName())
                .files(files)
                .build();

        NoticeDetailResponse created = noticeCommandService.create(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<NoticeDetailResponse> update(
            @PathVariable Long id,
            @Valid @ModelAttribute NoticeRequest request,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            Authentication authentication) {

        NoticeUpdateCommand command = NoticeUpdateCommand.builder()
                .noticeId(id)
                .title(request.getTitle())
                .content(request.getContent())
                .isPinned(request.getIsPinned())
                .updatedByEmail(authentication.getName())
                .files(files)
                .build();

        NoticeDetailResponse updated = noticeCommandService.update(command);
        return ResponseEntity.ok(updated);
    }

    /**
     * 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication) {

        noticeCommandService.delete(id, authentication.getName());
        return ResponseEntity.noContent().build();
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
     * 고정 토글
     */
    @PatchMapping("/{id}/pin")
    public ResponseEntity<Void> togglePin(
            @PathVariable Long id,
            Authentication authentication) {

        noticeCommandService.togglePin(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    /**
     * 콘텐츠 이미지 업로드 (Quill 에디터용)
     */
    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("upload") MultipartFile image,
            Authentication authentication) {

        String imageUrl = fileCommandService.uploadContentImage(
                image,
                File.EntityType.NOTICE,
                authentication.getName()
        );

        return ResponseEntity.ok(Map.of("url", imageUrl));
    }
}
