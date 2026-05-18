package com.example.locc.domain.newyear.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 송구영신예배 YouTube 재생목록 ID 수정 요청 DTO
 */
@Getter
@NoArgsConstructor
public class NewYearPlaylistUpdateRequest {

    @NotBlank(message = "재생목록 ID를 입력해주세요.")
    private String playlistId;
}
