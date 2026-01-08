package com.example.locc.domain.staff.dto.request;

import com.example.locc.domain.staff.entity.Staff;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Staff 생성/수정 요청 DTO
 * - Controller 입력 전용 (웹/API에서 들어오는 원본)
 * - Validation은 여기서만
 * - Controller에서 Command로 변환
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffRequest {

    @NotBlank(message = "이름은 필수입니다")
    @Size(max = 50, message = "이름은 50자를 초과할 수 없습니다")
    private String name;

    @NotBlank(message = "영문 이름은 필수입니다")
    @Size(max = 100, message = "영문 이름은 100자를 초과할 수 없습니다")
    private String englishName;

    @NotNull(message = "직분은 필수입니다")
    private Staff.StaffPosition position;

    @NotNull(message = "카테고리는 필수입니다")
    private Staff.StaffCategory category;

    @Builder.Default
    private Boolean isSeniorPastor = false;

    @Size(max = 50, message = "기타 직분명은 50자를 초과할 수 없습니다")
    private String customPosition;

    @Size(max = 200, message = "담당 업무는 200자를 초과할 수 없습니다")
    private String responsibility;

    private String imagePath;

    @Builder.Default
    private Integer displayOrder = 0;
}
