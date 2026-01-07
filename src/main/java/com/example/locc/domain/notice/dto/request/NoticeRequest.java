package com.example.locc.domain.notice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Notice 생성/수정 요청 DTO
 * - Controller 입력 전용 (웹/API에서 들어오는 원본)
 * - Validation은 여기서만
 * - Controller에서 Command로 변환
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticeRequest {

    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 200, message = "제목은 200자를 초과할 수 없습니다")
    private String title;

    @NotBlank(message = "내용은 필수입니다")
    private String content;

    @Builder.Default
    private Boolean isPinned = false;
}
