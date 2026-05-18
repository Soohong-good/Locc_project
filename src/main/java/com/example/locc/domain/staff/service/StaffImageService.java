package com.example.locc.domain.staff.service;

import com.example.locc.config.FileProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * 스태프 이미지 처리 Service
 * - 이미지 검증 (크기, MIME, Magic Bytes)
 * - 이미지 저장 및 경로 반환
 * - Controller의 private 메서드 책임 이전
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StaffImageService {

    private final FileProperties fileProperties;

    /**
     * 이미지 업로드 (검증 + 저장)
     * @return 웹 접근 경로 (예: /uploads/staff/xxx.jpg)
     */
    public String upload(MultipartFile file) {
        validate(file);
        try {
            return save(file);
        } catch (IOException e) {
            log.error("스태프 이미지 저장 실패: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("이미지 업로드에 실패했습니다.", e);
        }
    }

    /**
     * 이미지 파일 삭제
     * - 경로가 null이거나 파일이 없으면 무시
     */
    public void deleteByPath(String imagePath) {
        if (imagePath == null || imagePath.isBlank()) {
            return;
        }
        try {
            Files.deleteIfExists(Paths.get(imagePath));
            log.info("스태프 이미지 삭제 완료: {}", imagePath);
        } catch (IOException e) {
            log.error("스태프 이미지 삭제 실패: {}", imagePath, e);
        }
    }

    /**
     * 이미지 검증
     * - 파일 크기, 클라이언트 MIME 타입 1차 검증
     * - ImageIO.read()로 실제 바이트 파싱 (Magic Bytes 검증, MIME 위조 방지)
     */
    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("파일 크기는 10MB를 초과할 수 없습니다.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("이미지 파일만 업로드 가능합니다.");
        }

        try {
            java.awt.image.BufferedImage image =
                    javax.imageio.ImageIO.read(file.getInputStream());
            if (image == null) {
                throw new IllegalArgumentException("유효한 이미지 파일이 아닙니다. (MIME 타입 위조 의심)");
            }
        } catch (java.io.IOException e) {
            log.warn("스태프 이미지 Magic Bytes 검증 실패: {}", file.getOriginalFilename());
            throw new IllegalArgumentException("이미지 파일을 읽을 수 없습니다.");
        }
    }

    /**
     * 이미지 저장
     * @return 웹 접근 경로
     */
    private String save(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(fileProperties.getUploadDir(), "staff");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = (originalFilename != null && originalFilename.contains("."))
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String storedFilename = UUID.randomUUID().toString() + extension;

        Path filePath = uploadPath.resolve(storedFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/staff/" + storedFilename;
    }
}
