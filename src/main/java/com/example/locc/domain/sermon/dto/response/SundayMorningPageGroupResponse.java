package com.example.locc.domain.sermon.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.Map;

/**
 * 주일오전 그룹핑 목록 페이지 응답 DTO
 * - 날짜별 그룹 리스트 + 페이징 + YouTube 영상 정보
 */
@Getter
@Builder
public class SundayMorningPageGroupResponse {

    /** 날짜별 그룹 목록 */
    private final List<SundayMorningGroupResponse> groups;

    /** 가장 최근 그룹 (latestSermon 역할) */
    private final SundayMorningGroupResponse latestGroup;

    /** YouTube 최신 영상 (1부 플레이리스트) */
    private final List<Map<String, String>> youtubeVideos;

    private final int currentPage;
    private final int totalPages;
    private final long totalItems;
}
