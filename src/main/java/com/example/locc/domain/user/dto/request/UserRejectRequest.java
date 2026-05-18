package com.example.locc.domain.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 회원 반려 요청 DTO
 */
@Getter
@NoArgsConstructor
public class UserRejectRequest {
    @NotBlank
    @Size(max = 500)
    private String reason;
}
