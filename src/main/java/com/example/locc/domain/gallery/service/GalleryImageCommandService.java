package com.example.locc.domain.gallery.service;

import com.example.locc.config.CacheConfig;
import com.example.locc.config.FileProperties;
import com.example.locc.domain.department.entity.Department;
import com.example.locc.domain.department.repository.DepartmentRepository;
import com.example.locc.domain.gallery.dto.command.GalleryImageCreateCommand;
import com.example.locc.domain.gallery.dto.response.GalleryImageDetailResponse;
import com.example.locc.domain.gallery.entity.GalleryImage;
import com.example.locc.domain.gallery.repository.GalleryImageRepository;
import com.example.locc.domain.gallery.service.ImageFileValidator;
import com.example.locc.domain.gallery.service.ThumbnailGenerator;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.exception.NotFoundException;
import com.example.locc.exception.AccessDeniedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class GalleryImageCommandService {

    private final GalleryImageRepository galleryImageRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final ThumbnailGenerator thumbnailGenerator;
    private final ImageFileValidator imageFileValidator;
    private final FileProperties fileProperties;

    /**
     * 갤러리 이미지 업로드 (다중)
     */
    @CacheEvict(value = CacheConfig.CACHE_GALLERY_TITLES, allEntries = true)
    public List<GalleryImageDetailResponse> uploadImages(List<GalleryImageCreateCommand> commands, String userEmail) {
        log.debug("업로드 요청 - 커맨드 개수: {}, 사용자: {}", commands.size(), userEmail);

        // 1. 사용자 조회
        User uploader = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        // 2. 부서 조회 (첫 번째 커맨드에서)
        if (commands.isEmpty()) {
            log.error("업로드할 이미지가 없습니다.");
            throw new IllegalArgumentException("업로드할 이미지가 없습니다.");
        }

        Department department = departmentRepository.findByCode(commands.get(0).departmentCode())
                .orElseThrow(() -> new NotFoundException("부서를 찾을 수 없습니다."));

        // 3. 파일 I/O (검증·저장·리사이즈·썸네일) — 성공한 엔티티만 수집
        List<GalleryImage> entities = new ArrayList<>();

        for (GalleryImageCreateCommand command : commands) {
            try {
                MultipartFile imageFile = command.imageFile();
                imageFileValidator.validate(imageFile);

                String storedFilename = saveImageFile(imageFile);
                thumbnailGenerator.resizeOriginal(getGalleryDir(), storedFilename);
                String thumbnailFilename = thumbnailGenerator.generateThumbnail(getGalleryDir(), storedFilename);

                entities.add(GalleryImage.create(
                        department,
                        uploader,
                        command.title(),
                        command.description(),
                        imageFile.getOriginalFilename(),
                        storedFilename,
                        thumbnailFilename,
                        imageFile.getSize(),
                        command.displayOrder(),
                        command.groupId()
                ));
            } catch (Exception e) {
                log.error("이미지 업로드 실패: {}", command.imageFile().getOriginalFilename(), e);
            }
        }

        // 4. DB 저장 — saveAll()로 배치 insert
        List<GalleryImageDetailResponse> results = galleryImageRepository.saveAll(entities)
                .stream()
                .map(GalleryImageDetailResponse::from)
                .toList();

        log.info("갤러리 이미지 {} 개 업로드 완료 (부서: {})", results.size(), department.getName());
        return results;
    }

    /**
     * 갤러리 게시물 삭제 (같은 groupId에 속한 이미지 전체 삭제)
     */
    /**
     * 조회수 증가 후 상세 DTO 반환 (컨트롤러에서 findById를 두 번 호출하는 문제 방지)
     */
    public GalleryImageDetailResponse incrementViewCountAndGet(Long id) {
        GalleryImage image = galleryImageRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("갤러리 이미지를 찾을 수 없습니다."));
        image.incrementViewCount();
        return GalleryImageDetailResponse.from(image);
    }

    @CacheEvict(value = CacheConfig.CACHE_GALLERY_TITLES, allEntries = true)
    public void deleteImage(Long imageId, String userEmail) {
        // 1. 대표 이미지 조회
        GalleryImage representative = galleryImageRepository.findById(imageId)
                .orElseThrow(() -> new NotFoundException("갤러리 이미지를 찾을 수 없습니다."));

        // 2. 사용자 조회 및 권한 확인
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        if (!representative.canModify(user)) {
            throw new AccessDeniedException("이미지를 삭제할 권한이 없습니다.");
        }

        // 3. 같은 groupId의 이미지 전체 조회
        String groupId = representative.getGroupId();
        List<GalleryImage> groupImages = (groupId != null && !groupId.isBlank())
                ? galleryImageRepository.findAllByGroupId(groupId)
                : List.of(representative);

        // 4. 파일 전체 삭제 (원본 + 썸네일)
        groupImages.forEach(this::deleteImageFiles);

        // 5. DB 삭제
        if (groupId != null && !groupId.isBlank()) {
            galleryImageRepository.deleteAllByGroupId(groupId);
        } else {
            galleryImageRepository.delete(representative);
        }

        log.info("갤러리 게시물 삭제 완료: groupId={}, 삭제된 이미지 수={}", groupId, groupImages.size());
    }

    // ===== Private Methods =====

    private Path getGalleryDir() {
        return fileProperties.resolve("gallery");
    }

    /**
     * 이미지 파일 저장
     */
    private String saveImageFile(MultipartFile file) {
        try {
            String originalFilename = file.getOriginalFilename();

            // 파일명 검증
            if (originalFilename == null || originalFilename.isEmpty()) {
                throw new IllegalArgumentException("파일명이 없습니다.");
            }

            // 확장자 추출 (. 없으면 .jpg 기본값)
            int lastDotIndex = originalFilename.lastIndexOf(".");
            String extension = (lastDotIndex > 0 && lastDotIndex < originalFilename.length() - 1)
                    ? originalFilename.substring(lastDotIndex)
                    : ".jpg";

            String storedFilename = UUID.randomUUID() + extension;

            // gallery 디렉토리 보장 (존재 + 디렉토리 타입 검증)
            Path galleryDir = getGalleryDir();
            if (Files.exists(galleryDir) && !Files.isDirectory(galleryDir)) {
                throw new IllegalStateException("업로드 경로가 디렉토리가 아닙니다: " + galleryDir);
            }
            Files.createDirectories(galleryDir);

            // 파일 저장
            Path target = galleryDir.resolve(storedFilename).normalize();
            file.transferTo(target.toFile());

            log.debug("이미지 파일 저장 완료: {} (path={})", storedFilename, target);

            return storedFilename;

        } catch (IOException e) {
            log.error("이미지 파일 저장 실패", e);
            throw new RuntimeException("이미지 파일 저장 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 이미지 파일 삭제 (원본 + 썸네일)
     */
    private void deleteImageFiles(GalleryImage image) {
        Path galleryDir = getGalleryDir();

        // 원본 파일 삭제
        try {
            File originalFile = galleryDir.resolve(image.getStoredFilename()).toFile();
            if (originalFile.exists() && originalFile.delete()) {
                log.debug("원본 이미지 파일 삭제 완료: {}", image.getStoredFilename());
            }
        } catch (Exception e) {
            log.error("원본 이미지 파일 삭제 실패: {}", image.getStoredFilename(), e);
        }

        // 썸네일 파일 삭제
        if (image.getThumbnailFilename() != null) {
            thumbnailGenerator.deleteThumbnail(galleryDir, image.getThumbnailFilename());
        }
    }
}
