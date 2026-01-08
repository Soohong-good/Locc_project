package com.example.locc.domain.sermon.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Sermon 생성/수정 요청 DTO
 * - Controller 입력 전용 (웹/API에서 들어오는 원본)
 * - Validation은 여기서만
 * - Controller에서 Command로 변환
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SermonRequest {

    @NotBlank(message = "설교 제목은 필수입니다")
    @Size(max = 200, message = "제목은 200자를 초과할 수 없습니다")
    private String title;

    @Size(max = 100, message = "본문은 100자를 초과할 수 없습니다")
    private String scripture;

    @Size(max = 50, message = "설교자명은 50자를 초과할 수 없습니다")
    private String preacher;

    private String content;

    private String audioUrl;

    private String videoUrl;

    private String thumbnailUrl;

    private LocalDate sermonDate;

    @Size(max = 50, message = "카테고리는 50자를 초과할 수 없습니다")
    private String category;
}
