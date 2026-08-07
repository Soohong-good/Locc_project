package com.example.locc.domain.file.service;

import com.example.locc.config.FileProperties;
import com.example.locc.domain.file.entity.File;
import com.example.locc.domain.file.repository.FileRepository;
import com.example.locc.domain.file.service.PdfThumbnailGenerator;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    private final PdfThumbnailGenerator pdfThumbnailGenerator;
    private final AsyncPdfThumbnailService asyncPdfThumbnailService;
    private final FileProperties fileProperties;

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
            Path filePath = uploadPath.resolve(storedFilename).normalize();

            // 저장 경로가 업로드 디렉토리 하위인지 검증 (Path Traversal 방지)
            if (!filePath.startsWith(uploadPath.normalize())) {
                throw new IllegalArgumentException("잘못된 파일 경로입니다.");
            }

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
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 이미지 저장 (entityId=0: 본문 이미지는 특정 엔티티에 속하지 않음)
        File uploadedFile = uploadFile(
                image,
                entityType,
                0L,
                File.FileCategory.CONTENT_IMAGE,
                user
        );

        // 공개 이미지 URL 반환 (인증 없이 접근 가능한 /api/files/image/ 엔드포인트)
        return "/api/files/image/" + uploadedFile.getId();
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

    // ===== 도메인별 퍼사드 메서드 (외부 도메인용) =====
    // 외부 도메인은 File.EntityType / File.FileCategory 를 직접 알 필요 없이
    // 아래 메서드만 호출하면 됩니다.

    /** Notice 첨부파일 업로드 */
    public List<File> uploadNoticeAttachments(List<MultipartFile> files, Long entityId, String email) {
        return uploadFiles(files, File.EntityType.NOTICE, entityId, File.FileCategory.ATTACHMENT, email);
    }

    /** Notice 본문 이미지 업로드 → 공개 이미지 URL 반환 */
    public String uploadNoticeContentImage(MultipartFile image, String email) {
        return uploadContentImage(image, File.EntityType.NOTICE, email);
    }

    /** Notice 엔티티의 모든 파일 삭제 */
    public void deleteNoticeFiles(Long entityId) {
        deleteAllByEntity(File.EntityType.NOTICE, entityId);
    }

    /** PraiseSheet 첨부파일 업로드 */
    public List<File> uploadPraiseSheetAttachments(List<MultipartFile> files, Long entityId, String email) {
        return uploadFiles(files, File.EntityType.PRAISE_SHEET, entityId, File.FileCategory.ATTACHMENT, email);
    }

    /** PraiseSheet 본문 이미지 업로드 */
    public String uploadPraiseSheetContentImage(MultipartFile image, String email) {
        return uploadContentImage(image, File.EntityType.PRAISE_SHEET, email);
    }

    /** PraiseSheet 엔티티의 모든 파일 삭제 */
    public void deletePraiseSheetFiles(Long entityId) {
        deleteAllByEntity(File.EntityType.PRAISE_SHEET, entityId);
    }

    /** Sermon 첨부파일 업로드 */
    public List<File> uploadSermonAttachments(List<MultipartFile> files, Long entityId, String email) {
        return uploadFiles(files, File.EntityType.SERMON, entityId, File.FileCategory.ATTACHMENT, email);
    }

    /** Sermon 본문 이미지 업로드 → 공개 이미지 URL 반환 */
    public String uploadSermonContentImage(MultipartFile image, String email) {
        return uploadContentImage(image, File.EntityType.SERMON, email);
    }

    /** Sermon 엔티티의 모든 파일 삭제 */
    public void deleteSermonFiles(Long entityId) {
        deleteAllByEntity(File.EntityType.SERMON, entityId);
    }

    /** Popup 본문 이미지 업로드 → 공개 이미지 URL 반환 */
    public String uploadPopupContentImage(MultipartFile image, String email) {
        return uploadContentImage(image, File.EntityType.POPUP, email);
    }

    /** Bulletin 본문 이미지 업로드 → 공개 이미지 URL 반환 */
    public String uploadBulletinContentImage(MultipartFile image, String email) {
        return uploadContentImage(image, File.EntityType.BULLETIN, email);
    }

    /** Bulletin PDF 업로드 + 썸네일 생성 */
    public PdfUploadResult uploadBulletinPdf(MultipartFile pdfFile, Long entityId, User user) {
        return uploadPdfWithThumbnail(pdfFile, File.EntityType.BULLETIN, entityId, user);
    }

    // ===== Private Helper Methods =====

    /**
     * 파일 검증
     *
     * 3단계 검증:
     *   1. 파일 크기
     *   2. 확장자 + 클라이언트 제공 MIME 타입 (1차 필터)
     *   3. 이미지 파일은 실제 바이트 파싱으로 Magic Bytes 검증 (MIME 위조 방지)
     *      PDF는 Apache PDFBox 파싱이 있으므로 여기서는 MIME 검증까지만 수행
     */
    private void validateFile(MultipartFile file) {
        // 1. 파일 크기 검증
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    String.format("파일 크기가 제한을 초과했습니다. (최대: 10MB, 업로드 시도: %.2fMB)",
                            file.getSize() / (1024.0 * 1024.0))
            );
        }

        // 2. 파일명 검증
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new IllegalArgumentException("파일 이름이 유효하지 않습니다.");
        }

        // 3. 확장자 검증
        String extension = extractExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException(
                    String.format("허용되지 않는 파일 형식입니다. (허용: %s / 업로드 시도: %s)",
                            String.join(", ", ALLOWED_EXTENSIONS).toUpperCase(),
                            extension.toUpperCase())
            );
        }

        // 4. 클라이언트 제공 MIME 타입 검증 (1차 필터)
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    String.format("허용되지 않는 파일 타입입니다. (MIME Type: %s)", contentType)
            );
        }

        // 5. 이미지 파일 — 헤더 파싱으로 Magic Bytes + 픽셀 크기 검증 (MIME 위조 방지)
        //    전체 디코딩(ImageIO.read) 대신 헤더만 읽어 대형 이미지 디코딩으로 인한 OOM 방지
        //    PDF는 uploadPdfWithThumbnail()에서 PDFBox 파싱으로 별도 검증됨
        if (contentType.startsWith("image/")) {
            validateImageHeader(file, originalFilename);
        }
    }

    // 픽셀 수 상한 — 약 8000×5000. 파일 크기가 작아도 디코딩 시 메모리가 픽셀 수에 비례하므로 제한
    private static final long MAX_IMAGE_PIXELS = 40_000_000L;

    /**
     * 이미지 헤더 검증
     * - ImageReader 탐색 자체가 Magic Bytes 기반 → 포맷 위조 검출
     * - 헤더의 가로/세로만 읽으므로 전체 디코딩 메모리 비용 없음
     */
    private void validateImageHeader(MultipartFile file, String originalFilename) {
        try (javax.imageio.stream.ImageInputStream in =
                     javax.imageio.ImageIO.createImageInputStream(file.getInputStream())) {
            if (in == null) {
                throw new IllegalArgumentException("이미지 파일을 읽을 수 없습니다.");
            }
            java.util.Iterator<javax.imageio.ImageReader> readers =
                    javax.imageio.ImageIO.getImageReaders(in);
            if (!readers.hasNext()) {
                throw new IllegalArgumentException("유효한 이미지 파일이 아닙니다. (MIME 타입 위조 의심)");
            }
            javax.imageio.ImageReader reader = readers.next();
            try {
                reader.setInput(in);
                long width = reader.getWidth(0);
                long height = reader.getHeight(0);
                if (width <= 0 || height <= 0 || width * height > MAX_IMAGE_PIXELS) {
                    throw new IllegalArgumentException(
                            String.format("이미지 크기가 제한을 초과했습니다. (최대 %d만 픽셀, 업로드 시도: %d×%d)",
                                    MAX_IMAGE_PIXELS / 10_000, width, height));
                }
            } finally {
                reader.dispose();
            }
        } catch (IOException e) {
            log.warn("이미지 파일 헤더 검증 실패: {}", originalFilename);
            throw new IllegalArgumentException("이미지 파일을 읽을 수 없습니다.");
        }
    }

    /**
     * 이미지 파일 검증 (본문 이미지용)
     */
    private void validateImageFile(MultipartFile file) {
        // 이미지 파일 여부 검증 (클라이언트 제공 Content-Type — 1차 필터)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("이미지 파일만 업로드 가능합니다.");
        }

        // 파일 크기 검증
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("파일 크기는 10MB를 초과할 수 없습니다.");
        }

        // 실제 바이트 파싱으로 Magic Bytes 검증 (MIME 타입 위조 방지)
        try {
            java.awt.image.BufferedImage image = javax.imageio.ImageIO.read(file.getInputStream());
            if (image == null) {
                throw new IllegalArgumentException("유효한 이미지 파일이 아닙니다. (MIME 타입 위조 의심)");
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("이미지 파일을 읽을 수 없습니다.");
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
        Path uploadPath = fileProperties.resolve(entityType.name().toLowerCase());

        if (Files.exists(uploadPath) && !Files.isDirectory(uploadPath)) {
            throw new IllegalStateException("업로드 경로가 디렉토리가 아닙니다: " + uploadPath);
        }

        Files.createDirectories(uploadPath);
        return uploadPath;
    }


    /**
     * PDF 업로드 및 썸네일 자동 생성
     * - PDF 저장(ATTACHMENT) + 썸네일 저장(THUMBNAIL) 을 한 번에 처리
     * - BulletinCommandService 등에서 이 메서드 하나만 호출하면 됨
     *   (uploadFile 을 별도로 먼저 호출하면 PDF 가 이중 저장되므로 금지)
     *
     * @param pdfFile    PDF 파일
     * @param entityType 엔티티 타입
     * @param entityId   엔티티 ID
     * @param user       업로드 사용자
     * @return PdfUploadResult (pdfFileId, thumbnailUrl)
     */
    public PdfUploadResult uploadPdfWithThumbnail(
            MultipartFile pdfFile,
            File.EntityType entityType,
            Long entityId,
            User user
    ) {
        if (pdfFile == null || pdfFile.isEmpty()) {
            throw new IllegalArgumentException("PDF 파일이 비어있습니다.");
        }
        if (!"application/pdf".equals(pdfFile.getContentType())) {
            throw new IllegalArgumentException("PDF 파일만 업로드 가능합니다.");
        }

        try {
            // 1. PDF 바이트를 미리 읽어 둠 (InputStream은 한 번만 소비 가능하므로)
            byte[] pdfBytes = pdfFile.getInputStream().readAllBytes();

            // 2. PDF 원본 저장 (ATTACHMENT)
            File savedPdf = uploadFile(pdfFile, entityType, entityId, File.FileCategory.ATTACHMENT, user);

            // 3. 썸네일 경로 미리 결정 → DB 레코드 선저장
            String thumbnailFilename = UUID.randomUUID() + ".jpg";
            Path uploadPath = createUploadPath(entityType);
            Path thumbnailPath = uploadPath.resolve(thumbnailFilename);

            File thumbnailFile = File.create(
                    pdfFile.getOriginalFilename() + "_thumbnail.jpg",
                    thumbnailFilename,
                    thumbnailPath.toString(),
                    0L,         // 비동기 렌더링 완료 전이므로 크기는 0
                    "image/jpeg",
                    entityType,
                    entityId,
                    File.FileCategory.THUMBNAIL,
                    user
            );
            File savedThumbnail = fileRepository.save(thumbnailFile);

            // 4. PDFBox 렌더링(무거운 CPU 작업)을 비동기로 위임
            asyncPdfThumbnailService.renderAndSave(pdfBytes, thumbnailPath);

            log.info("PDF 업로드 완료 (썸네일 비동기 처리 중): PDF={}, 썸네일={}", savedPdf.getId(), savedThumbnail.getId());

            return new PdfUploadResult(savedPdf.getId(), "/api/files/image/" + savedThumbnail.getId());

        } catch (IOException e) {
            log.error("PDF 업로드 실패", e);
            throw new RuntimeException("PDF 업로드에 실패했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * PDF 업로드 결과 (원본 파일 ID + 썸네일 URL)
     */
    public record PdfUploadResult(Long pdfFileId, String thumbnailUrl) {}
}
