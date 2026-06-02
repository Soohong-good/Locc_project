package com.example.locc.domain.user.dto.request;

import com.example.locc.domain.user.dto.command.UserRegisterCommand;
import com.example.locc.domain.user.entity.User;
import jakarta.validation.constraints.Email;
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
 * User 회원가입 Request DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRegisterRequest {

    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다")
    @Size(min = 8, message = "비밀번호는 최소 8자 이상이어야 합니다")
    @Pattern(
        regexp = "^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[^a-zA-Z\\d\\s]).{8,}$",
        message = "비밀번호는 영문, 숫자, 특수문자를 각각 1자 이상 포함해야 합니다"
    )
    private String password;

    @NotBlank(message = "이름은 필수입니다")
    @Size(max = 50, message = "이름은 50자를 초과할 수 없습니다")
    private String name;

    private String gender;

    private String phoneNumber;

    @NotNull(message = "회원 유형은 필수입니다")
    private User.UserType userType;

    // 미등록교인 추가 필드
    private String address;

    private LocalDate birth;

    @Size(max = 500, message = "등록 경로는 500자를 초과할 수 없습니다")
    private String registrationPath;

    // 약관 동의
    @NotNull(message = "서비스 이용약관 동의는 필수입니다")
    private Boolean agreedToTerms;

    @NotNull(message = "개인정보 처리방침 동의는 필수입니다")
    private Boolean agreedToPrivacy;

    private Boolean agreedToMarketing;

    /**
     * Request → Command 변환
     */
    public UserRegisterCommand toCommand() {
        return UserRegisterCommand.builder()
                .email(email)
                .password(password)
                .name(name)
                .gender(gender)
                .phoneNumber(phoneNumber)
                .address(address)
                .birth(birth)
                .registrationPath(registrationPath)
                .userType(userType != null ? userType : User.UserType.REGISTERED)
                .agreedToTerms(agreedToTerms)
                .agreedToPrivacy(agreedToPrivacy)
                .agreedToMarketing(agreedToMarketing != null ? agreedToMarketing : false)
                .build();
    }
}
