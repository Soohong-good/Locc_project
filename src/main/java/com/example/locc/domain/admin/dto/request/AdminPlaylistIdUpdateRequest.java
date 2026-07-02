package com.example.locc.domain.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 예배 재생목록 ID 수정 요청 DTO
 */
@Getter
@NoArgsConstructor
public class AdminPlaylistIdUpdateRequest {

    @NotBlank(message = "재생목록 ID를 입력해주세요.")
    private String playlistId;
}
