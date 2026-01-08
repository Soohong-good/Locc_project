package com.example.locc.domain.file.service;

import com.example.locc.domain.file.entity.File;
import com.example.locc.domain.file.repository.FileRepository;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * File 명령 전용 서비스
 * - CUD 작업만 처리
 * - 트랜잭션 관리
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class FileCommandService {

    private final FileRepository fileRepository;
    private final FileQueryService fileQueryService;
    private final UserRepository userRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    // 파일 검증 상수
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final List<String> ALLOWED_EXTENSIONS = List.of("pdf", "jpg", "jpeg", "png", "gif", "webp");
    private static final List<String> ALLOWED_MIME_TYPES = List.of(
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp"
    );

    /**
     * 파일 업로드 (단일)
     */
    public File uploadFile(
            MultipartFile file,
            File.EntityType entityType,
            Long entityId,
            File.FileCategory category,
            String email
    ) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return uploadFile(file, entityType, entityId, category, user);
    }

    /**
     * 파일 업로드 (단일) - User 객체로
     */
    public File uploadFile(
            MultipartFile file,
            File.EntityType entityType,
            Long entityId,
            File.FileCategory category,
            User user
    ) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }

        // 파일 검증
        validateFile(file);

        try {
            String originalFilename = file.getOriginalFilename();
            String storedFilename = generateStoredFilename(originalFilename);

            // 파일 저장 경로 생성
            Path uploadPath = createUploadPath(entityType);
            Path filePath = uploadPath.resolve(storedFilename);

            // 물리적 파일 저장
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // 메타데이터 저장 (팩토리 메서드 사용)
            File fileEntity = File.create(
                    originalFilename,
                    storedFilename,
                    filePath.toString(),
                    file.getSize(),
                    file.getContentType(),
                    entityType,
                    entityId,
                    category,
                    user
            );

            File savedFile = fileRepository.save(fileEntity);

            log.info("파일 업로드 성공: {} -> {} ({}MB, 엔티티: {}/{})",
                    originalFilename,
                    storedFilename,
                    String.format("%.2f", file.getSize() / (1024.0 * 1024.0)),
                    entityType,
                    entityId
            );

            return savedFile;

        } catch (IOException e) {
            log.error("파일 업로드 실패: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("파일 업로드에 실패했습니다: " + file.getOriginalFilename(), e);
        }
    }

    /**
     * 파일 업로드 (다중)
     */
    public List<File> uploadFiles(
            List<MultipartFile> files,
            File.EntityType entityType,
            Long entityId,
            File.FileCategory category,
            String email
    ) {
        if (files == null || files.isEmpty()) {
            return new ArrayList<>();
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return files.stream()
                .filter(file -> file != null && !file.isEmpty())
                .map(file -> uploadFile(file, entityType, entityId, category, user))
                .collect(Collectors.toList());
    }

    /**
     * 본문 이미지 업로드 (Notice, Sermon용)
     */
    public String uploadContentImage(
            MultipartFile image,
            File.EntityType entityType,
            String email
    ) {
        // 이미지 검증
        validateImageFile(image);

        // User 조회
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + email));

        // 이미지 저장 (entityId=0: 본문 이미지는 특정 엔티티에 속하지 않음)
        File uploadedFile = uploadFile(
                image,
                entityType,
                0L,
                File.FileCategory.CONTENT_IMAGE,
                user
        );

        // 다운로드 URL 반환
        return "/api/files/download/" + uploadedFile.getId();
    }

    /**
     * 파일 삭제 (단일)
     */
    public void deleteFile(Long fileId) {
        File file = fileQueryService.getFile(fileId);

        try {
            // 물리적 파일 삭제
            Path filePath = Paths.get(file.getFilePath());
            Files.deleteIfExists(filePath);

            // DB에서 삭제
            fileRepository.delete(file);

            log.info("파일 삭제 성공: {} (엔티티: {}/{})",
                    file.getOriginalFileName(),
                    file.getEntityType(),
                    file.getEntityId()
            );

        } catch (IOException e) {
            log.error("물리적 파일 삭제 실패: {}", file.getOriginalFileName(), e);
            throw new RuntimeException("파일 삭제에 실패했습니다: " + file.getOriginalFileName(), e);
        }
    }

    /**
     * 특정 엔티티의 모든 파일 삭제
     */
    public void deleteAllByEntity(File.EntityType entityType, Long entityId) {
        List<File> files = fileQueryService.getFilesByEntity(entityType, entityId);

        for (File file : files) {
            try {
                Path filePath = Paths.get(file.getFilePath());
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                log.error("파일 삭제 실패: {}", file.getOriginalFileName(), e);
            }
        }

        fileRepository.deleteByEntityTypeAndEntityId(entityType, entityId);

        log.info("엔티티의 모든 파일 삭제 완료: {}/{} ({}개)",
                entityType,
                entityId,
                files.size()
        );
    }

    // ===== Private Helper Methods =====

    /**
     * 파일 검증
     */
    private void validateFile(MultipartFile file) {
        // 파일 크기 검증
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    String.format("파일 크기가 제한을 초과했습니다. (최대: 10MB, 업로드 시도: %.2fMB)",
                            file.getSize() / (1024.0 * 1024.0))
            );
        }

        // 파일명 검증
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new IllegalArgumentException("파일 이름이 유효하지 않습니다.");
        }

        // 확장자 검증
        String extension = extractExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException(
                    String.format("허용되지 않는 파일 형식입니다. (허용: %s / 업로드 시도: %s)",
                            String.join(", ", ALLOWED_EXTENSIONS).toUpperCase(),
                            extension.toUpperCase())
            );
        }

        // MIME 타입 검증
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    String.format("허용되지 않는 파일 타입입니다. (MIME Type: %s)", contentType)
            );
        }
    }

    /**
     * 이미지 파일 검증 (본문 이미지용)
     */
    private void validateImageFile(MultipartFile file) {
        // 이미지 파일 여부 검증
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("이미지 파일만 업로드 가능합니다.");
        }

        // 파일 크기 검증
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("파일 크기는 10MB를 초과할 수 없습니다.");
        }
    }

    /**
     * 저장 파일명 생성
     */
    private String generateStoredFilename(String originalFilename) {
        String extension = extractExtension(originalFilename);
        return UUID.randomUUID().toString() + "." + extension;
    }

    /**
     * 파일 확장자 추출
     */
    private String extractExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    /**
     * 업로드 경로 생성
     */
    private Path createUploadPath(File.EntityType entityType) throws IOException {
        Path uploadPath = Paths.get(uploadDir, entityType.name().toLowerCase());
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        return uploadPath;
    }
}
