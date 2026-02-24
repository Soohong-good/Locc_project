package com.example.locc.domain.gallery.dto.response;

import com.example.locc.domain.gallery.entity.GalleryImage;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * 갤러리 목록용 Response (썸네일 위주)
 */
public record GalleryImageResponse(
        Long id,
        String title,          // 제목 = 앨범 그룹화
        String description,
        String thumbnailFilename,
        String storedFilename,
        String uploaderName,   // 업로더 이름
        Integer imageCount,    // 같은 제목의 이미지 개수
        Integer viewCount,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        LocalDateTime createdAt
) {
    public static GalleryImageResponse from(GalleryImage image) {
        return new GalleryImageResponse(
                image.getId(),
                image.getTitle(),
                image.getDescription(),
                image.getThumbnailFilename(),
                image.getStoredFilename(),
                image.getUploader().getName(),
                1,  // 기본값, QueryService에서 설정
                image.getViewCount(),
                image.getCreatedAt()
        );
    }
    
    /**
     * 이미지 개수 포함 생성
     */
    public static GalleryImageResponse from(GalleryImage image, int imageCount) {
        return new GalleryImageResponse(
                image.getId(),
                image.getTitle(),
                image.getDescription(),
                image.getThumbnailFilename(),
                image.getStoredFilename(),
                image.getUploader().getName(),
                imageCount,
                image.getViewCount(),
                image.getCreatedAt()
        );
    }
}
