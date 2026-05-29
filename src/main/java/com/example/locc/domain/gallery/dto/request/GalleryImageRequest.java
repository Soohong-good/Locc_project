package com.example.locc.domain.gallery.dto.request;

import com.example.locc.domain.gallery.dto.command.GalleryImageCreateCommand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public record GalleryImageRequest(
        @NotBlank(message = "제목을 입력해주세요")
        @Size(max = 200, message = "제목은 200자 이내로 입력해주세요")
        String title,

        @Size(max = 1000, message = "설명은 1000자 이내로 입력해주세요")
        String description,

        @NotEmpty(message = "이미지를 선택해주세요")
        List<MultipartFile> imageFiles,

        // 기존 그룹에 이미지 추가 시 사용 (없으면 새 그룹 생성)
        String groupId
) {
    public List<GalleryImageCreateCommand> toCreateCommands(String departmentCode) {
        if (imageFiles == null || imageFiles.isEmpty()) {
            return List.of();
        }

        // 기존 groupId 있으면 재사용, 없으면 새로 생성
        String groupId = (this.groupId != null && !this.groupId.isBlank())
                ? this.groupId
                : "group_" + System.currentTimeMillis();
        
        return imageFiles.stream()
                .filter(file -> file != null && !file.isEmpty())
                .map(file -> new GalleryImageCreateCommand(
                        departmentCode,
                        title,
                        description,
                        file,
                        null,      // displayOrder는 서비스에서 자동 설정
                        groupId    // 같은 그룹 ID
                ))
                .toList();
    }
}
