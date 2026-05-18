package com.example.locc.domain.gallery.service;

import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;

@Slf4j
@Component
public class ThumbnailGenerator {

    private static final int THUMBNAIL_WIDTH  = 400;
    private static final int THUMBNAIL_HEIGHT = 300;
    private static final String THUMBNAIL_PREFIX = "thumb_";

    /** 원본 리사이즈 최대 너비 (이 이하면 리사이즈 생략) */
    private static final int RESIZE_MAX_WIDTH = 1920;

    /**
     * 원본 이미지 리사이즈 (최대 1920px, 비율 유지)
     * - 원본이 1920px 이하이면 그대로 저장
     * - GIF는 리사이즈 생략 (애니메이션 깨짐 방지)
     */
    public String resizeOriginal(Path galleryDir, String storedFilename) {
        if (storedFilename.toLowerCase().endsWith(".gif")) {
            log.debug("GIF 파일 리사이즈 생략: {}", storedFilename);
            return storedFilename;
        }

        try {
            Path target = galleryDir.resolve(storedFilename);

            Thumbnails.of(target.toFile())
                    .size(RESIZE_MAX_WIDTH, RESIZE_MAX_WIDTH)
                    .keepAspectRatio(true)
                    .outputQuality(0.85)
                    .toFile(target.toFile());

            log.debug("원본 이미지 리사이즈 완료: {} (최대 {}px)", storedFilename, RESIZE_MAX_WIDTH);
            return storedFilename;

        } catch (IOException e) {
            log.error("원본 이미지 리사이즈 실패: {}", storedFilename, e);
            return storedFilename;
        }
    }

    /**
     * 썸네일 생성 (400×300, 비율 유지)
     */
    public String generateThumbnail(Path galleryDir, String storedFilename) {
        try {
            String thumbnailFilename = THUMBNAIL_PREFIX + storedFilename;
            Path source    = galleryDir.resolve(storedFilename);
            Path thumbPath = galleryDir.resolve(thumbnailFilename);

            Thumbnails.of(source.toFile())
                    .size(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT)
                    .keepAspectRatio(true)
                    .outputQuality(0.80)
                    .toFile(thumbPath.toFile());

            log.debug("썸네일 생성 완료: {}", thumbnailFilename);
            return thumbnailFilename;

        } catch (IOException e) {
            log.error("썸네일 생성 실패: {}", storedFilename, e);
            return null;
        }
    }

    /**
     * 썸네일 삭제
     */
    public void deleteThumbnail(Path uploadDir, String thumbnailFilename) {
        if (thumbnailFilename == null || thumbnailFilename.isEmpty()) {
            return;
        }

        try {
            File thumbnailFile = uploadDir.resolve(thumbnailFilename).toFile();
            if (thumbnailFile.exists() && thumbnailFile.delete()) {
                log.debug("썸네일 삭제 완료: {}", thumbnailFilename);
            }
        } catch (Exception e) {
            log.error("썸네일 삭제 실패: {}", thumbnailFilename, e);
        }
    }
}
