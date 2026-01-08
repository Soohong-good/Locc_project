package com.example.locc.domain.gallery.dto.command;

import org.springframework.web.multipart.MultipartFile;

public record GalleryImageCreateCommand(
        String departmentCode,
        String title,          // 제목 = 앨범 그룹화
        String description,
        MultipartFile imageFile,
        Integer displayOrder
) {
}
