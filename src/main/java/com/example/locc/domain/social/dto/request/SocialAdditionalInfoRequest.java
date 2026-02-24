package com.example.locc.domain.social.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 소셜 로그인 추가 정보 입력 요청 DTO
 * 이메일/비밀번호는 이미 소셜 계정에서 받음
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialAdditionalInfoRequest {

    @NotBlank(message = "이름은 필수입니다")
    @Size(max = 50, message = "이름은 50자를 초과할 수 없습니다")
    private String name;

    @NotBlank(message = "성별은 필수입니다")
    private String gender;

    @NotBlank(message = "전화번호는 필수입니다")
    @Pattern(regexp = "^010-\\d{4}-\\d{4}$", message = "전화번호 형식이 올바르지 않습니다 (010-0000-0000)")
    private String phoneNumber;

    private LocalDate birth;

    @Size(max = 200, message = "주소는 200자를 초과할 수 없습니다")
    private String address;

    @Size(max = 500, message = "등록 경로는 500자를 초과할 수 없습니다")
    private String registrationPath;

    @NotNull(message = "교인 구분은 필수입니다")
    private String userType; // REGISTERED 또는 UNREGISTERED

    @NotNull(message = "이용약관 동의는 필수입니다")
    private Boolean agreedToTerms;

    @NotNull(message = "개인정보처리방침 동의는 필수입니다")
    private Boolean agreedToPrivacy;
}
