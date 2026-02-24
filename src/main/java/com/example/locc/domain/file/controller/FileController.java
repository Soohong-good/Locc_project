package com.example.locc.domain.file.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.domain.file.dto.FileResponse;
import com.example.locc.domain.file.entity.File;
import com.example.locc.domain.file.service.FileCommandService;
import com.example.locc.domain.file.service.FileQueryService;
import com.example.locc.exception.AccessDeniedException;
import com.example.locc.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
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
     * - CONTENT_IMAGE, THUMBNAIL, GALLERY_IMAGE 카테고리만 허용
     * - 이 외의 카테고리(ATTACHMENT, MANUSCRIPT 등)는 403 반환
     * - SecurityConfig에서 /api/files/image/** 는 permitAll 처리
     */
    @GetMapping("/image/{fileId}")
    public ResponseEntity<Resource> getPublicImage(@PathVariable Long fileId) {
        File file = fileQueryService.getFile(fileId);

        if (!isPublicImageCategory(file.getCategory())) {
            throw new AccessDeniedException("접근이 허용되지 않는 파일입니다.");
        }

        Resource resource = fileQueryService.loadFileAsResource(fileId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400") // 공개 이미지 1일 캐시
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

        String encodedFileName = URLEncoder.encode(file.getOriginalFileName(), StandardCharsets.UTF_8)
                .replace("+", "%20");

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + encodedFileName + "\"")
                .body(resource);
    }

    // ───── 파일 메타데이터 조회 (ADMIN) ─────

    /**
     * 파일 정보 조회 (단일)
     */
    @GetMapping("/{fileId}")
    public ResponseEntity<ApiResponse<FileResponse>> getFile(@PathVariable Long fileId) {
        File file = fileQueryService.getFileWithUploader(fileId);
        if (file == null) {
            throw new NotFoundException("파일을 찾을 수 없습니다. ID: " + fileId);
        }
        return ResponseEntity.ok(ApiResponse.ok(FileResponse.from(file)));
    }

    /**
     * 특정 엔티티의 파일 목록 조회
     */
    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<ApiResponse<List<FileResponse>>> getFilesByEntity(
            @PathVariable File.EntityType entityType,
            @PathVariable Long entityId) {

        List<FileResponse> files = fileQueryService
                .getFilesByEntityWithUploader(entityType, entityId)
                .stream()
                .map(FileResponse::from)
                .toList();

        return ResponseEntity.ok(ApiResponse.ok(files));
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

    // ───── private ─────

    private boolean isPublicImageCategory(File.FileCategory category) {
        return category == File.FileCategory.CONTENT_IMAGE
                || category == File.FileCategory.THUMBNAIL
                || category == File.FileCategory.GALLERY_IMAGE;
    }
}
