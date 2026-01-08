package com.example.locc.domain.gallery.dto.response;

import com.example.locc.domain.gallery.entity.GalleryImage;

import java.util.List;

/**
 * 인스타그램 스타일 갤러리 그룹 응답
 * 같은 title을 가진 이미지들을 하나의 카드로 표시하기 위한 DTO
 * 성능 최적화: 커버 이미지와 카운트만 반환 (상세는 별도 API 호출)
 */
public record GalleryGroupResponse(
        String title,               // 제목 = 갤러리 그룹명
        int imageCount,             // 그룹 내 이미지 개수
        GalleryImageResponse coverImage  // 대표 이미지 (첫 번째 이미지)
) {
    /**
     * 이미지 리스트로부터 갤러리 그룹 생성
     */
    public static GalleryGroupResponse from(String title, List<GalleryImage> images) {
        if (images.isEmpty()) {
            return null;
        }

        return new GalleryGroupResponse(
                title != null ? title : "제목 없음",
                images.size(),
                GalleryImageResponse.from(images.get(0)) // 첫 번째 이미지를 커버로
        );
    }
}
