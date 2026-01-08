package com.example.locc.domain.gallery.util;

import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;

/**
 * 이미지 썸네일 생성 유틸리티
 */
@Slf4j
@Component
public class ThumbnailGenerator {

    private static final int THUMBNAIL_WIDTH = 400;
    private static final int THUMBNAIL_HEIGHT = 300;
    private static final String THUMBNAIL_PREFIX = "thumb_";

    /**
     * 썸네일 생성
     * @param originalFilePath 원본 파일 경로
     * @param storedFilename 저장된 파일명
     * @return 썸네일 파일명 (예: thumb_uuid.jpg)
     */
    public String generateThumbnail(Path originalFilePath, String storedFilename) {
        try {
            String thumbnailFilename = THUMBNAIL_PREFIX + storedFilename;
            File thumbnailFile = originalFilePath.getParent().resolve(thumbnailFilename).toFile();

            Thumbnails.of(originalFilePath.toFile())
                    .size(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT)
                    .keepAspectRatio(true) // 비율 유지
                    .toFile(thumbnailFile);

            log.debug("썸네일 생성 완료: {}", thumbnailFilename);
            return thumbnailFilename;

        } catch (IOException e) {
            log.error("썸네일 생성 실패: {}", storedFilename, e);
            return null; // 썸네일 생성 실패 시 null 반환 (원본 이미지 사용)
        }
    }

    /**
     * 썸네일 삭제
     * @param uploadDir 업로드 디렉토리
     * @param thumbnailFilename 썸네일 파일명
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
