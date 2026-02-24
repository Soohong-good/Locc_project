package com.example.locc.domain.sermon.controller;

import com.example.locc.config.YouTubeProperties;
import com.example.locc.domain.department.service.YouTubeService;
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
 * - 공개 API: 조회
 * - 관리자 API: 생성, 수정, 삭제 (ADMIN 권한 필요)
 */
@Slf4j
@RestController
@RequestMapping("/api/sermons")
@RequiredArgsConstructor
public class SermonApiController {

    private final SermonQueryService sermonQueryService;
    private final SermonCommandService sermonCommandService;
    private final FileCommandService fileCommandService;
    private final YouTubeService youTubeService;
    private final YouTubeProperties youTubeProperties;

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
     * 기타예배 탭 전환용 API (수요예배/금요기도회)
     * @param type wednesday 또는 friday
     */
    @GetMapping("/weekday/{type}")
    public ResponseEntity<Map<String, Object>> getWeekdayData(
            @PathVariable String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("기타예배 데이터 조회: type={}, page={}", type, page);

        // type을 serviceNumber로 변환
        int serviceNumber = "wednesday".equals(type) ? 1 : 2;

        // YouTube 최신 영상 조회 (수요예배 또는 금요기도회)
        String playlistId = youTubeProperties.getPlaylistId(type);
        List<Map<String, String>> youtubeVideos = List.of();
        
        if (playlistId != null && !playlistId.isEmpty()) {
            youtubeVideos = youTubeService.getLatestVideos(playlistId, 1);
        }

        // 설교 목록 조회
        Page<SermonResponse> sermons = sermonQueryService.findByCategoryAndServiceNumber(
                "기타예배", 
                serviceNumber, 
                page, 
                size
        );
        
        // 최신 설교
        List<SermonResponse> latestSermons = sermonQueryService
                .findLatestByCategoryAndServiceNumber("기타예배", serviceNumber, 1);
        SermonResponse latestSermon = latestSermons.isEmpty() ? null : latestSermons.get(0);

        // 응답 데이터 구성
        Map<String, Object> response = Map.of(
                "sermons", sermons.getContent(),
                "latestSermon", latestSermon != null ? latestSermon : Map.of(),
                "youtubeVideos", youtubeVideos,
                "currentPage", page,
                "totalPages", sermons.getTotalPages(),
                "totalItems", sermons.getTotalElements(),
                "selectedType", type
        );

        return ResponseEntity.ok(response);
    }

    /**
     * 주일오전 탭 전환용 API (1부/2부)
     * @param serviceNumber 1 또는 2
     */
    @GetMapping("/sunday-morning/{serviceNumber}")
    public ResponseEntity<Map<String, Object>> getSundayMorningData(
            @PathVariable Integer serviceNumber,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("주일오전 데이터 조회: serviceNumber={}, page={}", serviceNumber, page);

        // YouTube 최신 영상 조회
        String playlistKey = "sunday-morning-" + serviceNumber;
        String playlistId = youTubeProperties.getPlaylistId(playlistKey);
        List<Map<String, String>> youtubeVideos = List.of();
        
        if (playlistId != null && !playlistId.isEmpty()) {
            youtubeVideos = youTubeService.getLatestVideos(playlistId, 1);
        }

        // 설교 목록 조회
        Page<SermonResponse> sermons = sermonQueryService.findByCategoryAndServiceNumber(
                "주일오전", 
                serviceNumber, 
                page, 
                size
        );
        
        // 최신 설교
        List<SermonResponse> latestSermons = sermonQueryService
                .findLatestByCategoryAndServiceNumber("주일오전", serviceNumber, 1);
        SermonResponse latestSermon = latestSermons.isEmpty() ? null : latestSermons.get(0);

        // 응답 데이터 구성
        Map<String, Object> response = Map.of(
                "sermons", sermons.getContent(),
                "latestSermon", latestSermon != null ? latestSermon : Map.of(),
                "youtubeVideos", youtubeVideos,
                "currentPage", page,
                "totalPages", sermons.getTotalPages(),
                "totalItems", sermons.getTotalElements(),
                "selectedServiceNumber", serviceNumber
        );

        return ResponseEntity.ok(response);
    }

    /**
     * 설교 생성 (관리자 전용)
     */
    @PostMapping
    public ResponseEntity<SermonDetailResponse> create(
            @Valid @ModelAttribute SermonRequest request,
            Authentication authentication) {
        
        log.info("설교 생성: title={}, user={}", request.getTitle(), authentication.getName());
        
        SermonCreateCommand command = SermonCreateCommand.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .category(request.getCategory())
                .serviceNumber(request.getServiceNumber())
                .preacher(request.getPreacher())
                .scripture(request.getScripture())
                .sermonDate(request.getSermonDate())
                .videoUrl(request.getVideoUrl())
                .files(request.getFiles())
                .createdByEmail(authentication.getName())
                .build();
        
        SermonDetailResponse response = sermonCommandService.create(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 설교 수정 (관리자 전용)
     */
    @PutMapping("/{id}")
    public ResponseEntity<SermonDetailResponse> update(
            @PathVariable Long id,
            @Valid @ModelAttribute SermonRequest request,
            Authentication authentication) {
        
        log.info("설교 수정: id={}, user={}", id, authentication.getName());
        
        SermonUpdateCommand command = SermonUpdateCommand.builder()
                .sermonId(id)
                .title(request.getTitle())
                .content(request.getContent())
                .category(request.getCategory())
                .serviceNumber(request.getServiceNumber())
                .preacher(request.getPreacher())
                .scripture(request.getScripture())
                .sermonDate(request.getSermonDate())
                .videoUrl(request.getVideoUrl())
                .files(request.getFiles())
                .updatedByEmail(authentication.getName())
                .build();
        
        SermonDetailResponse response = sermonCommandService.update(command);
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
                File.EntityType.SERMON,
                authentication.getName()
        );
        
        return ResponseEntity.ok(Map.of("url", imageUrl));
    }

    /**
     * 삭제 (관리자 전용)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication) {
        
        log.info("설교 삭제: id={}, user={}", id, authentication.getName());
        sermonCommandService.delete(id, authentication.getName());
        
        return ResponseEntity.noContent().build();
    }
}
