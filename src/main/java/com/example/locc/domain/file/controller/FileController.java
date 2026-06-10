package com.example.locc.domain.file.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.domain.file.dto.response.FileResponse;
import com.example.locc.domain.file.entity.File;
import com.example.locc.domain.file.service.FileCommandService;
import com.example.locc.domain.file.service.FileQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.ContentDisposition;

import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * File API Controller
 *
 * 엔드포인트 설계:
 *   GET  /api/files/image/{fileId}          - 공개 이미지 접근 (인증 불필요, CONTENT_IMAGE/THUMBNAIL/GALLERY_IMAGE)
 *   GET  /api/files/download/{fileId}       - 보호 파일 다운로드 (인증 필요, SecurityConfig 설정)
 *   GET  /api/files/{fileId}                - 파일 메타데이터 조회 (인증 필요, ADMIN)
 *   GET  /api/files/entity/{type}/{id}      - 엔티티별 파일 목록 조회 (인증 필요, ADMIN)
 *   DELETE /api/files/{fileId}              - 파일 삭제 (ADMIN)
 */
@Slf4j
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileCommandService fileCommandService;
    private final FileQueryService fileQueryService;

    // ───── 공개 이미지 접근 (인증 불필요) ─────

    /**
     * 공개 이미지 스트리밍
     */
    @GetMapping("/image/{fileId}")
    public ResponseEntity<Resource> getPublicImage(@PathVariable Long fileId) {
        File file = fileQueryService.getPublicFile(fileId);
        Resource resource = fileQueryService.loadFileAsResource(fileId);

        // contentType이 null인 레거시 파일 대응: 파일명 확장자로 추론
        String rawContentType = file.getContentType();
        if (rawContentType == null || rawContentType.isBlank()) {
            String name = file.getOriginalFileName() != null ? file.getOriginalFileName().toLowerCase() : "";
            if (name.endsWith(".png"))       rawContentType = "image/png";
            else if (name.endsWith(".gif"))  rawContentType = "image/gif";
            else if (name.endsWith(".webp")) rawContentType = "image/webp";
            else                             rawContentType = "image/jpeg";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(rawContentType))
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                .body(resource);
    }

    /**
     * 공개 PDF 스트리밍 (인증 불필요)
     * - NEWYEAR 엔티티의 ATTACHMENT PDF만 허용
     * - SecurityConfig에서 /api/files/pdf/** 는 permitAll 처리
     */
    @GetMapping("/pdf/{fileId}")
    public ResponseEntity<Resource> getPublicPdf(@PathVariable Long fileId) {
        File file = fileQueryService.getFile(fileId);

        // NEWYEAR 엔티티의 PDF만 공개 허용
        if (file.getEntityType() != File.EntityType.NEWYEAR
                || !"application/pdf".equals(file.getContentType())) {
            return ResponseEntity.status(403).build();
        }

        Resource resource = fileQueryService.loadFileAsResource(fileId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(resource);
    }

    // ───── 보호 파일 다운로드 (인증 필요) ─────

    /**
     * 파일 다운로드 (attachment)
     * - SecurityConfig에서 /api/files/download/** 는 authenticated 처리
     */
    @GetMapping("/download/{fileId}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long fileId) {
        File file = fileQueryService.getFile(fileId);
        Resource resource = fileQueryService.loadFileAsResource(fileId);

        String contentDisposition = ContentDisposition.attachment()
                .filename(file.getOriginalFileName(), StandardCharsets.UTF_8)
                .build()
                .toString();

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                .body(resource);
    }

    // ───── 파일 메타데이터 조회 (ADMIN) ─────

    /**
     * 파일 정보 조회 (단일)
     */
    @GetMapping("/{fileId}")
    public ResponseEntity<ApiResponse<FileResponse>> getFile(@PathVariable Long fileId) {
        return ResponseEntity.ok(ApiResponse.ok(fileQueryService.getFileResponse(fileId)));
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<ApiResponse<List<FileResponse>>> getFilesByEntity(
            @PathVariable File.EntityType entityType,
            @PathVariable Long entityId) {
        return ResponseEntity.ok(ApiResponse.ok(
                fileQueryService.getFileResponsesByEntity(entityType, entityId)));
    }

    // ───── 파일 삭제 (ADMIN) ─────

    /**
     * 파일 삭제
     */
    @DeleteMapping("/{fileId}")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@PathVariable Long fileId) {
        fileCommandService.deleteFile(fileId);
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
