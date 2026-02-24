package com.example.locc.domain.gallery.dto.response;

/**
 * 갤러리 그룹 DTO 프로젝션
 * 성능 최적화: 필요한 데이터만 조회
 */
public record GalleryGroupDto(
        String title,
        Long imageCount,
        String coverStoredFilename,
        String coverThumbnailFilename
) {
    /**
     * GalleryGroupResponse로 변환
     */
    public GalleryGroupResponse toResponse() {
        // 간단한 커버 이미지 정보만 담은 Response 생성
        GalleryImageResponse coverImage = new GalleryImageResponse(
                null,  // id
                this.title,
                null,  // description
                this.coverThumbnailFilename,
                this.coverStoredFilename,
                "시스템",  // uploaderName
                this.imageCount.intValue(),  // imageCount
                0,     // viewCount
                null   // createdAt
        );
        
        return new GalleryGroupResponse(
                this.title,
                this.imageCount.intValue(),
                coverImage
        );
    }
}
