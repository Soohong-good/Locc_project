package com.example.locc.domain.gallery.dto.request;

public record GalleryImageSearchCondition(
        String departmentCode,
        String groupName, // null이면 전체, 값이 있으면 해당 그룹만
        Integer page,
        Integer size
) {
    public GalleryImageSearchCondition {
        page = page != null && page >= 0 ? page : 0;
        size = size != null && size > 0 ? Math.min(size, 30) : 12; // 최대 30개
    }
}
