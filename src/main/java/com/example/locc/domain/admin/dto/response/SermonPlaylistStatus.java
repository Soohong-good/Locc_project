package com.example.locc.domain.admin.dto.response;

/**
 * 주일/수요·금요예배 재생목록 현황 응답 DTO
 */
public record SermonPlaylistStatus(
        String key,
        String label,
        String playlistId,
        String latestVideoId,
        String latestVideoTitle
) {}
