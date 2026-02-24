package com.example.locc.domain.gallery.dto.command;

import org.springframework.web.multipart.MultipartFile;

public record GalleryImageCreateCommand(
        String departmentCode,
        String title,
        String description,
        MultipartFile imageFile,
        Integer displayOrder,
        String groupId         // 그룹 ID 추가
) {
}
