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
 * - 공개 API: 조회만 담당
 * - 수정/삭제는 /api/admin/sermons/** 사용
 */
@Slf4j
@RestController
@RequestMapping("/api/sermons")
@RequiredArgsConstructor
public class SermonApiController {

    private final SermonQueryService sermonQueryService;

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
}
