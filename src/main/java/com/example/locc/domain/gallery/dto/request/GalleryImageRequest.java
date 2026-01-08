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
        String title,  // 제목 = 앨범 그룹화

        @Size(max = 1000, message = "설명은 1000자 이내로 입력해주세요")
        String description,

        @NotEmpty(message = "이미지를 선택해주세요")
        List<MultipartFile> imageFiles  // 다중 파일 업로드
) {
    /**
     * Request → CreateCommand 변환 (다중 파일)
     */
    public List<GalleryImageCreateCommand> toCreateCommands(String departmentCode) {
        if (imageFiles == null || imageFiles.isEmpty()) {
            return List.of();
        }
        
        return imageFiles.stream()
                .filter(file -> file != null && !file.isEmpty())
                .map(file -> new GalleryImageCreateCommand(
                        departmentCode,
                        title,         // 제목 = 앨범 그룹화
                        description,
                        file,
                        null  // displayOrder는 서비스에서 자동 설정
                ))
                .toList();
    }
}
