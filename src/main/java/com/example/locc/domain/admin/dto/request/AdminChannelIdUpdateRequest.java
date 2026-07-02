package com.example.locc.domain.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 부서 YouTube 채널 ID 수정 요청 DTO
 */
@Getter
@NoArgsConstructor
public class AdminChannelIdUpdateRequest {

    @NotBlank(message = "채널 ID를 입력해주세요.")
    private String channelId;
}
