package com.example.locc.domain.file.controller;

import com.example.locc.domain.file.dto.FileDto;
import com.example.locc.domain.file.entity.File;
import com.example.locc.domain.file.service.FileCommandService;
import com.example.locc.domain.file.service.FileQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * File API Controller
 * - 파일 다운로드, 조회, 삭제
 * - Command/Query Service 분리
 */
@Slf4j
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileCommandService fileCommandService;
    private final FileQueryService fileQueryService;

    /**
     * 파일 다운로드
     */
    @GetMapping("/download/{fileId}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long fileId) {
        try {
            File file = fileQueryService.getFile(fileId);
            Resource resource = fileQueryService.loadFileAsResource(fileId);

            // 파일명 인코딩 (한글 파일명 지원)
            String encodedFileName = encodeFileName(file.getOriginalFileName());

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(file.getContentType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + encodedFileName + "\"")
                    .body(resource);

        } catch (Exception e) {
            log.error("파일 다운로드 실패: fileId={}", fileId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 파일 정보 조회 (단일)
     */
    @GetMapping("/{fileId}")
    public ResponseEntity<FileDto> getFile(@PathVariable Long fileId) {
        try {
            File file = fileQueryService.getFileWithUploader(fileId);
            return ResponseEntity.ok(FileDto.fromEntity(file));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 특정 엔티티의 파일 목록 조회
     */
    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<List<FileDto>> getFilesByEntity(
            @PathVariable File.EntityType entityType,
            @PathVariable Long entityId
    ) {
        List<File> files = fileQueryService.getFilesByEntityWithUploader(entityType, entityId);
        List<FileDto> fileDtos = files.stream()
                .map(FileDto::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(fileDtos);
    }

    /**
     * 파일 삭제
     */
    @DeleteMapping("/{fileId}")
    public ResponseEntity<Map<String, String>> deleteFile(@PathVariable Long fileId) {
        try {
            fileCommandService.deleteFile(fileId);
            return ResponseEntity.ok(Map.of(
                    "message", "파일이 삭제되었습니다.",
                    "fileId", fileId.toString()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("파일 삭제 실패: fileId={}", fileId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "파일 삭제에 실패했습니다."));
        }
    }

    /**
     * 파일명 인코딩 (한글 파일명 지원)
     */
    private String encodeFileName(String fileName) {
        try {
            return URLEncoder.encode(fileName, StandardCharsets.UTF_8.toString())
                    .replaceAll("\\+", "%20");
        } catch (UnsupportedEncodingException e) {
            return fileName;
        }
    }
}
