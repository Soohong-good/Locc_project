package com.example.locc.domain.user.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 비밀번호 변경 Request DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPasswordChangeRequest {

    @NotBlank(message = "현재 비밀번호는 필수입니다")
    private String currentPassword;

    @NotBlank(message = "새 비밀번호는 필수입니다")
    @Size(min = 8, message = "비밀번호는 최소 8자 이상이어야 합니다")
    @Pattern(
        regexp = "^(?=.*[a-zA-Z])(?=.*\\d).{8,}$",
        message = "비밀번호는 영문자와 숫자를 각각 1자 이상 포함해야 합니다"
    )
    private String newPassword;

    @NotBlank(message = "비밀번호 확인은 필수입니다")
    private String newPasswordConfirm;

    @AssertTrue(message = "새 비밀번호가 일치하지 않습니다.")
    public boolean isPasswordConfirmed() {
        return newPassword != null && newPassword.equals(newPasswordConfirm);
    }
}
