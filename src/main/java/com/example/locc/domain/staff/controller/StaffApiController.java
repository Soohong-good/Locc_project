package com.example.locc.domain.staff.controller;

import com.example.locc.config.FileProperties;
import com.example.locc.domain.staff.dto.command.StaffCreateCommand;
import com.example.locc.domain.staff.dto.command.StaffUpdateCommand;
import com.example.locc.domain.staff.dto.request.StaffRequest;
import com.example.locc.domain.staff.dto.response.StaffResponse;
import com.example.locc.domain.staff.entity.Staff;
import com.example.locc.domain.staff.service.StaffCommandService;
import com.example.locc.domain.staff.service.StaffQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Staff API Controller
 * - 요청/응답 처리만 담당
 * - Request → Command 변환 (Controller 책임)
 * - 비즈니스 로직은 Service에 위임
 */
@Slf4j
@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffApiController {

    private final StaffCommandService staffCommandService;
    private final StaffQueryService staffQueryService;
    private final FileProperties fileProperties;

    /**
     * 전체 목록 조회
     */
    @GetMapping
    public ResponseEntity<List<StaffResponse>> list() {
        List<StaffResponse> staff = staffQueryService.findAll();
        return ResponseEntity.ok(staff);
    }

    /**
     * 카테고리별 조회
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<StaffResponse>> listByCategory(
            @PathVariable Staff.StaffCategory category) {
        List<StaffResponse> staff = staffQueryService.findByCategory(category);
        return ResponseEntity.ok(staff);
    }

    /**
     * 담임목사 조회
     */
    @GetMapping("/senior-pastor")
    public ResponseEntity<List<StaffResponse>> seniorPastors() {
        List<StaffResponse> staff = staffQueryService.findSeniorPastors();
        return ResponseEntity.ok(staff);
    }

    /**
     * 설교자 목록 조회 (담임목사, 목사, 전도사)
     */
    @GetMapping("/preachers")
    public ResponseEntity<List<StaffResponse>> preachers() {
        List<StaffResponse> staff = staffQueryService.findPreachers();
        return ResponseEntity.ok(staff);
    }

    /**
     * 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<StaffResponse> detail(@PathVariable Long id) {
        StaffResponse staff = staffQueryService.findById(id);
        return ResponseEntity.ok(staff);
    }

    /**
     * 생성
     * - Request를 받아서 Command로 변환 (Controller 책임)
     */
    @PostMapping
    public ResponseEntity<StaffResponse> create(
            @Valid @RequestBody StaffRequest request,
            Authentication authentication) {

        // Request → Command 변환
        StaffCreateCommand command = StaffCreateCommand.builder()
                .name(request.getName())
                .englishName(request.getEnglishName())
                .position(request.getPosition())
                .category(request.getCategory())
                .isSeniorPastor(request.getIsSeniorPastor())
                .customPosition(request.getCustomPosition())
                .responsibility(request.getResponsibility())
                .imagePath(request.getImagePath())
                .displayOrder(request.getDisplayOrder())
                .createdByEmail(authentication.getName())
                .build();

        StaffResponse created = staffCommandService.create(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 수정
     * - Request를 받아서 Command로 변환 (Controller 책임)
     */
    @PutMapping("/{id}")
    public ResponseEntity<StaffResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody StaffRequest request,
            Authentication authentication) {

        // Request → Command 변환
        StaffUpdateCommand command = StaffUpdateCommand.builder()
                .staffId(id)
                .name(request.getName())
                .englishName(request.getEnglishName())
                .position(request.getPosition())
                .category(request.getCategory())
                .isSeniorPastor(request.getIsSeniorPastor())
                .customPosition(request.getCustomPosition())
                .responsibility(request.getResponsibility())
                .imagePath(request.getImagePath())
                .displayOrder(request.getDisplayOrder())
                .updatedByEmail(authentication.getName())
                .build();

        StaffResponse updated = staffCommandService.update(command);
        return ResponseEntity.ok(updated);
    }

    /**
     * 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication) {

        staffCommandService.delete(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    /**
     * 이미지 업로드
     */
    @PostMapping("/{id}/image")
    public ResponseEntity<Map<String, String>> uploadImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile image,
            Authentication authentication) {

        log.info("Uploading image for staff: {}", id);

        try {
            // 이미지 검증
            validateImage(image);
            
            // 파일 저장
            String imagePath = saveImage(image);
            
            // Staff 이미지 경로 업데이트
            StaffResponse updated = staffCommandService.updateImage(id, imagePath, authentication.getName());
            
            return ResponseEntity.ok(Map.of("imagePath", updated.getImagePath()));
        } catch (IOException e) {
            log.error("Failed to upload image", e);
            throw new RuntimeException("이미지 업로드에 실패했습니다.", e);
        }
    }

    /**
     * 이미지 삭제
     */
    @DeleteMapping("/{id}/image")
    public ResponseEntity<Void> deleteImage(
            @PathVariable Long id,
            Authentication authentication) {

        log.info("Deleting image for staff: {}", id);

        // 기존 이미지 경로 조회
        StaffResponse staff = staffQueryService.findById(id);
        
        if (staff.getImagePath() != null) {
            try {
                // 물리적 파일 삭제
                Path filePath = Paths.get(staff.getImagePath());
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                log.error("Failed to delete image file", e);
            }
        }
        
        // Staff 이미지 경로 제거
        staffCommandService.updateImage(id, null, authentication.getName());
        
        return ResponseEntity.noContent().build();
    }
    
    // ===== Private Helper Methods =====
    
    /**
     * 이미지 검증
     */
    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }
        
        // 파일 크기 검증 (10MB)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("파일 크기는 10MB를 초과할 수 없습니다.");
        }
        
        // 파일 타입 검증
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("이미지 파일만 업로드 가능합니다.");
        }
    }
    
    /**
     * 이미지 저장
     */
    private String saveImage(MultipartFile file) throws IOException {
        // 업로드 디렉토리 생성
        Path uploadPath = Paths.get(fileProperties.getUploadDir(), "staff");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // 고유 파일명 생성
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String storedFilename = UUID.randomUUID().toString() + extension;
        
        // 파일 저장
        Path filePath = uploadPath.resolve(storedFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        // 웹 접근 경로 반환
        return "/uploads/staff/" + storedFilename;
    }
}
