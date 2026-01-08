package com.example.locc.domain.sermon.controller;

import com.example.locc.domain.sermon.dto.command.SermonCreateCommand;
import com.example.locc.domain.sermon.dto.command.SermonUpdateCommand;
import com.example.locc.domain.sermon.dto.request.SermonRequest;
import com.example.locc.domain.sermon.dto.request.SermonSearchCondition;
import com.example.locc.domain.sermon.dto.response.SermonDetailResponse;
import com.example.locc.domain.sermon.dto.response.SermonResponse;
import com.example.locc.domain.sermon.service.SermonCommandService;
import com.example.locc.domain.sermon.service.SermonQueryService;
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
 * Sermon API Controller
 * - 요청/응답 처리만 담당
 * - Request → Command 변환 (Controller 책임)
 * - 비즈니스 로직은 Service에 위임
 */
@Slf4j
@RestController
@RequestMapping("/api/sermons")
@RequiredArgsConstructor
public class SermonApiController {

    private final SermonCommandService sermonCommandService;
    private final SermonQueryService sermonQueryService;
    private final FileCommandService fileCommandService;

    /**
     * 목록 조회
     */
    @GetMapping
    public ResponseEntity<Page<SermonResponse>> list(@ModelAttribute SermonSearchCondition condition) {
        Page<SermonResponse> sermons = sermonQueryService.findList(condition);
        return ResponseEntity.ok(sermons);
    }

    /**
     * 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<SermonDetailResponse> detail(@PathVariable Long id) {
        SermonDetailResponse sermon = sermonQueryService.findDetail(id);
        return ResponseEntity.ok(sermon);
    }

    /**
     * 최근 설교 조회
     */
    @GetMapping("/latest")
    public ResponseEntity<List<SermonResponse>> latest(
            @RequestParam(defaultValue = "5") int limit) {
        List<SermonResponse> sermons = sermonQueryService.findLatest(limit);
        return ResponseEntity.ok(sermons);
    }

    /**
     * 카테고리별 설교 조회
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<Page<SermonResponse>> listByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        SermonSearchCondition condition = SermonSearchCondition.builder()
                .category(category)
                .page(page)
                .size(size)
                .build();
        
        Page<SermonResponse> sermons = sermonQueryService.findList(condition);
        return ResponseEntity.ok(sermons);
    }

    /**
     * 카테고리별 최신 설교 조회
     */
    @GetMapping("/category/{category}/latest")
    public ResponseEntity<SermonResponse> latestByCategory(@PathVariable String category) {
        List<SermonResponse> sermons = sermonQueryService.findLatestByCategory(category, 1);
        
        if (sermons.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(sermons.get(0));
    }

    /**
     * 생성
     */
    @PostMapping
    public ResponseEntity<SermonDetailResponse> create(
            @Valid @ModelAttribute SermonRequest request,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            Authentication authentication) {

        SermonCreateCommand command = SermonCreateCommand.builder()
                .title(request.getTitle())
                .scripture(request.getScripture())
                .preacher(request.getPreacher())
                .content(request.getContent())
                .audioUrl(request.getAudioUrl())
                .videoUrl(request.getVideoUrl())
                .thumbnailUrl(request.getThumbnailUrl())
                .sermonDate(request.getSermonDate())
                .category(request.getCategory())
                .createdByEmail(authentication.getName())
                .files(files)
                .build();

        SermonDetailResponse created = sermonCommandService.create(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<SermonDetailResponse> update(
            @PathVariable Long id,
            @Valid @ModelAttribute SermonRequest request,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            Authentication authentication) {

        SermonUpdateCommand command = SermonUpdateCommand.builder()
                .sermonId(id)
                .title(request.getTitle())
                .scripture(request.getScripture())
                .preacher(request.getPreacher())
                .content(request.getContent())
                .audioUrl(request.getAudioUrl())
                .videoUrl(request.getVideoUrl())
                .thumbnailUrl(request.getThumbnailUrl())
                .sermonDate(request.getSermonDate())
                .category(request.getCategory())
                .updatedByEmail(authentication.getName())
                .files(files)
                .build();

        SermonDetailResponse updated = sermonCommandService.update(command);
        return ResponseEntity.ok(updated);
    }

    /**
     * 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication) {

        sermonCommandService.delete(id, authentication.getName());
        return ResponseEntity.noContent().build();
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
                File.EntityType.SERMON,
                authentication.getName()
        );

        return ResponseEntity.ok(Map.of("url", imageUrl));
    }
}
