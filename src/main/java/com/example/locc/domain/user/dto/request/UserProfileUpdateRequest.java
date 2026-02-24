package com.example.locc.domain.user.dto.request;

import com.example.locc.domain.user.dto.command.UserUpdateCommand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 마이페이지 프로필 수정 Request DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileUpdateRequest {

    @NotBlank(message = "이름은 필수입니다")
    @Size(max = 50, message = "이름은 50자를 초과할 수 없습니다")
    private String name;

    private String gender;

    private String phoneNumber;

    private String address;

    private LocalDate birth;

    /**
     * Request -> Command 변환
     */
    public UserUpdateCommand toCommand() {
        return UserUpdateCommand.builder()
                .name(name)
                .gender(gender)
                .phoneNumber(phoneNumber)
                .address(address)
                .birth(birth)
                .build();
    }
}
