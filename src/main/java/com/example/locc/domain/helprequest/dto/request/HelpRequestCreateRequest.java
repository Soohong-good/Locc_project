package com.example.locc.domain.helprequest.dto.request;

import com.example.locc.domain.helprequest.dto.command.HelpRequestCreateCommand;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 도움 요청 생성 Request DTO
 */
@Getter
@NoArgsConstructor
public class HelpRequestCreateRequest {

    @NotBlank(message = "이름을 입력해주세요.")
    @Size(max = 50, message = "이름은 50자 이내로 입력해주세요.")
    private String name;

    @NotBlank(message = "전화번호를 입력해주세요.")
    @Size(max = 20, message = "전화번호는 20자 이내로 입력해주세요.")
    private String phone;

    @NotBlank(message = "이메일을 입력해주세요.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    @Size(max = 100, message = "이메일은 100자 이내로 입력해주세요.")
    private String email;

    @NotBlank(message = "도움이 필요한 내용을 입력해주세요.")
    @Size(max = 2000, message = "내용은 2000자 이내로 입력해주세요.")
    private String content;

    public HelpRequestCreateCommand toCommand() {
        return HelpRequestCreateCommand.builder()
                .name(this.name)
                .phone(this.phone)
                .email(this.email)
                .content(this.content)
                .build();
    }
}
