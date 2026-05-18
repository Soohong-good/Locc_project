package com.example.locc.domain.bibleschool.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 성경학교 YouTube 재생목록 ID 수정 요청 DTO
 */
@Getter
@NoArgsConstructor
public class BibleSchoolPlaylistUpdateRequest {

    @NotBlank(message = "재생목록 ID를 입력해주세요.")
    private String playlistId;
}
