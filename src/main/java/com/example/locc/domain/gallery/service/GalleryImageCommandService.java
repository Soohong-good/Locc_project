package com.example.locc.domain.gallery.service;

import com.example.locc.config.FileProperties;
import com.example.locc.domain.department.entity.Department;
import com.example.locc.domain.department.repository.DepartmentRepository;
import com.example.locc.domain.gallery.dto.command.GalleryImageCreateCommand;
import com.example.locc.domain.gallery.dto.response.GalleryImageDetailResponse;
import com.example.locc.domain.gallery.entity.GalleryImage;
import com.example.locc.domain.gallery.repository.GalleryImageRepository;
import com.example.locc.domain.gallery.util.ImageFileValidator;
import com.example.locc.domain.gallery.util.ThumbnailGenerator;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.exception.NotFoundException;
import com.example.locc.exception.AccessDeniedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

        // 3. 모든 이미지 업로드
        List<GalleryImageDetailResponse> results = new ArrayList<>();

        for (GalleryImageCreateCommand command : commands) {
            try {
                // 이미지 파일 검증
                MultipartFile imageFile = command.imageFile();
                imageFileValidator.validate(imageFile);

                // 파일 저장 (gallery 하위 디렉토리)
                String storedFilename = saveImageFile(imageFile);

                // 썸네일 생성 (임시로 비활성화)
                String thumbnailFilename = null;
                // String thumbnailFilename = thumbnailGenerator.generateThumbnail(getGalleryDir(), storedFilename);

                // 엔티티 생성
                GalleryImage image = GalleryImage.create(
                        department,
                        uploader,
                        command.title(),
                        command.description(),
                        imageFile.getOriginalFilename(),
                        storedFilename,
                        thumbnailFilename,
                        imageFile.getSize(),
                        command.displayOrder(),
                        command.groupId()        // groupId 추가
                );

                // 저장
                GalleryImage savedImage = galleryImageRepository.save(image);
                results.add(GalleryImageDetailResponse.from(savedImage));

            } catch (Exception e) {
                log.error("이미지 업로드 실패: {}", command.imageFile().getOriginalFilename(), e);
                // 일부 실패해도 계속 진행
            }
        }

        log.info("갤러리 이미지 {} 개 업로드 완료 (부서: {})", results.size(), department.getName());
        return results;
    }

    /**
     * 갤러리 이미지 삭제
     */
    public void deleteImage(Long id, String userEmail) {
        // 1. 이미지 조회
        GalleryImage image = galleryImageRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("갤러리 이미지를 찾을 수 없습니다."));

        // 2. 사용자 조회
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        // 3. 권한 확인
        if (!image.canModify(user)) {
            throw new AccessDeniedException("이미지를 삭제할 권한이 없습니다.");
        }

        // 4. 파일 삭제
        deleteImageFiles(image);

        // 5. DB 삭제
        galleryImageRepository.delete(image);

        log.info("갤러리 이미지 삭제 완료: {}", image.getTitle());
    }

    /**
     * 조회수 증가
     */
    public void incrementViewCount(Long id) {
        GalleryImage image = galleryImageRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("갤러리 이미지를 찾을 수 없습니다."));

        image.incrementViewCount();
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
