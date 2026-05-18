package com.example.locc.domain.gallery.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
public class ImageFileValidator {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "gif", "webp");
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp"
    );

    public void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("파일 크기는 10MB를 초과할 수 없습니다.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !hasValidExtension(originalFilename)) {
            throw new IllegalArgumentException("허용되지 않는 파일 형식입니다. (jpg, jpeg, png, gif, webp만 가능)");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("허용되지 않는 MIME 타입입니다.");
        }

        // 실제 이미지 파일인지 검증 (Content-Type 스푸핑 방지)
        try {
            BufferedImage image = ImageIO.read(file.getInputStream());
            if (image == null) {
                throw new IllegalArgumentException("유효한 이미지 파일이 아닙니다.");
            }
        } catch (IOException e) {
            log.error("이미지 파일 읽기 실패", e);
            throw new IllegalArgumentException("이미지 파일을 읽을 수 없습니다.");
        }
    }

    private boolean hasValidExtension(String filename) {
        String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        return ALLOWED_EXTENSIONS.contains(extension);
    }
}
