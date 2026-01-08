package com.example.locc.domain.gallery.dto.command;

public record GalleryImageUpdateCommand(
        Long id,
        String title,          // 제목 = 앨범 그룹화
        String description
) {
}
