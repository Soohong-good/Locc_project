package com.example.locc.domain.file.service;

import com.example.locc.config.FileProperties;
import com.example.locc.domain.file.dto.response.AttachmentInfo;
import com.example.locc.domain.file.dto.response.FileResponse;
import com.example.locc.domain.file.entity.File;
import com.example.locc.domain.file.entity.File.EntityType;
import com.example.locc.domain.file.repository.FileRepository;
import com.example.locc.exception.AccessDeniedException;
import com.example.locc.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * File 조회 전용 서비스
 * - 읽기 전용 트랜잭션
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FileQueryService {

    private final FileRepository fileRepository;
    private final FileProperties fileProperties;
    private final FileUrlResolver fileUrlResolver;

    /**
     * 파일 조회 (ID로)
     */
    public File getFile(Long fileId) {
        return fileRepository.findById(fileId)
                .orElseThrow(() -> new NotFoundException("파일을 찾을 수 없습니다. ID: " + fileId));
    }

    // 이미지로 간주할 파일 확장자 목록
    private static final java.util.Set<String> IMAGE_EXTENSIONS =
            java.util.Set.of("jpg", "jpeg", "png", "gif", "webp", "bmp", "svg");

    /**
     * 공개 이미지 파일 조회
     * - 공개 카테고리(CONTENT_IMAGE, THUMBNAIL, GALLERY_IMAGE)이거나
     *   contentType 또는 파일 확장자 기준으로 이미지인 경우 허용
     * - PDF, HWP 등 비이미지 첨부파일은 AccessDeniedException (403)
     *
     * contentType이 null로 저장된 레거시 파일을 위해 확장자 폴백 추가
     */
    public File getPublicFile(Long fileId) {
        File file = getFile(fileId);

        // 1. 카테고리 기반 공개 여부
        boolean isPublicCategory = file.getCategory() != null && file.getCategory().isPublic();

        // 2. contentType 기반 이미지 여부 (null-safe)
        String contentType = file.getContentType();
        boolean isImageByMime = contentType != null && contentType.startsWith("image/");

        // 3. 파일명 확장자 기반 폴백 (contentType이 null인 레거시 파일 대응)
        boolean isImageByExt = false;
        if (!isImageByMime) {
            String name = file.getOriginalFileName();
            if (name != null) {
                int dot = name.lastIndexOf('.');
                if (dot >= 0) {
                    String ext = name.substring(dot + 1).toLowerCase();
                    isImageByExt = IMAGE_EXTENSIONS.contains(ext);
                }
            }
        }

        if (!isPublicCategory && !isImageByMime && !isImageByExt) {
            log.warn("공개 이미지 접근 거부: fileId={}, category={}, contentType={}",
                    fileId, file.getCategory(), contentType);
            throw new AccessDeniedException("접근이 허용되지 않는 파일입니다.");
        }
        return file;
    }

    public File getFileWithUploader(Long fileId) {
        return fileRepository.findByIdWithUploader(fileId)
                .orElseThrow(() -> new NotFoundException("파일을 찾을 수 없습니다. ID: " + fileId));
    }

    /**
     * 특정 엔티티의 파일 목록 조회 → FileResponse 변환까지 담당
     */
    public List<FileResponse> getFileResponsesByEntity(File.EntityType entityType, Long entityId) {
        return fileUrlResolver.toResponses(
                fileRepository.findByEntityTypeAndEntityIdWithUploader(entityType, entityId)
        );
    }

    /**
     * 파일 단건 조회 → FileResponse 변환까지 담당
     */
    public FileResponse getFileResponse(Long fileId) {
        return fileUrlResolver.toResponse(getFileWithUploader(fileId));
    }

    /**
     * 특정 엔티티의 모든 파일 조회
     */
    public List<File> getFilesByEntity(File.EntityType entityType, Long entityId) {
        return fileRepository.findByEntityTypeAndEntityId(entityType, entityId);
    }

    /**
     * 특정 엔티티의 파일 조회 (업로더 정보 포함)
     */
    public List<File> getFilesByEntityWithUploader(File.EntityType entityType, Long entityId) {
        return fileRepository.findByEntityTypeAndEntityIdWithUploader(entityType, entityId);
    }

    /**
     * 특정 엔티티의 특정 카테고리 파일 조회
     */
    public List<File> getFilesByEntityAndCategory(
            File.EntityType entityType,
            Long entityId,
            File.FileCategory category
    ) {
        return fileRepository.findByEntityTypeAndEntityIdAndCategory(entityType, entityId, category);
    }

    /**
     * 파일 개수 조회
     */
    public long countByEntity(File.EntityType entityType, Long entityId) {
        return fileRepository.countByEntityTypeAndEntityId(entityType, entityId);
    }

    /**
     * 여러 엔티티의 파일 개수를 한 번에 조회 (N+1 방지)
     * @return Map<entityId, count>
     */
    public Map<Long, Long> countByEntities(File.EntityType entityType, List<Long> entityIds) {
        if (entityIds == null || entityIds.isEmpty()) {
            return Collections.emptyMap();
        }

        List<Object[]> results = fileRepository.countByEntityTypeAndEntityIdIn(entityType, entityIds);

        return results.stream()
                .collect(Collectors.toMap(
                    row -> (Long) row[0],
                    row -> (Long) row[1]
                ));
    }

    // ===== 도메인별 퍼사드 메서드 (외부 도메인용) =====
    // 외부 도메인은 File.EntityType / File.FileCategory 를 직접 알 필요 없이
    // 아래 메서드만 호출하면 됩니다.

    /** Notice 첨부파일 조회 → AttachmentInfo 변환까지 담당 */
    public List<AttachmentInfo> getNoticeAttachments(Long entityId) {
        return fileRepository.findByEntityTypeAndEntityIdWithUploader(EntityType.NOTICE, entityId)
                .stream()
                .map(AttachmentInfo::from)
                .collect(Collectors.toList());
    }

    /** Notice 첨부파일 개수 일괄 조회 (N+1 방지) */
    public Map<Long, Long> countNoticeAttachments(List<Long> entityIds) {
        return countByEntities(EntityType.NOTICE, entityIds);
    }

    /** Sermon 첨부파일 조회 → AttachmentInfo 변환까지 담당 */
    public List<AttachmentInfo> getSermonAttachments(Long entityId) {
        return fileRepository.findByEntityTypeAndEntityIdWithUploader(EntityType.SERMON, entityId)
                .stream()
                .map(AttachmentInfo::from)
                .collect(Collectors.toList());
    }

    /** Sermon 첨부파일 개수 일괄 조회 (N+1 방지) */
    public Map<Long, Long> countSermonAttachments(List<Long> entityIds) {
        return countByEntities(EntityType.SERMON, entityIds);
    }

    // ===== 파일 리소스 =====

    /**
     * 파일 리소스 로드 (다운로드용)
     *
     * Path Traversal 방지:
     *   - DB에 저장된 filePath를 그대로 신뢰하지 않고
     *     허용된 업로드 루트 디렉터리 하위인지 반드시 검증
     *   - 정상 경로: {uploadRoot}/notice/abc123.pdf  → 허용
     *   - 공격 경로: {uploadRoot}/../../../etc/passwd → 차단
     */
    public Resource loadFileAsResource(Long fileId) {
        File file = getFile(fileId);

        try {
            Path filePath = Paths.get(file.getFilePath()).normalize().toAbsolutePath();

            // 업로드 루트 경로 하위인지 검증 (Path Traversal 방지)
            Path uploadRoot = fileProperties.getUploadRootPath();
            if (!filePath.startsWith(uploadRoot)) {
                log.warn("Path Traversal 시도 감지: fileId={}, path={}", fileId, filePath);
                throw new AccessDeniedException("접근이 허용되지 않는 파일 경로입니다.");
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                log.warn("파일이 디스크에 존재하지 않음: fileId={}, path={}", fileId, filePath);
                throw new NotFoundException("파일을 찾을 수 없습니다: " + file.getOriginalFileName());
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("파일 경로가 잘못되었습니다: " + file.getOriginalFileName(), e);
        }
    }
}
