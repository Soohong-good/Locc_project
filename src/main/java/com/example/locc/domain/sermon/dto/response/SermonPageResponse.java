package com.example.locc.domain.sermon.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.Map;

/**
 * 설교 페이지 전용 통합 응답 DTO
 * - 설교 목록 + 최신 설교 + YouTube 영상 정보를 하나로 묶어 반환
 * - React SPA 페이지 단위 조회용 (주일오전/오후, 수요예배, 금요기도회, 훈련용메시지, 수련회특강)
 */
@Getter
@Builder
public class SermonPageResponse {

    private List<SermonResponse> sermons;
    private SermonResponse latestSermon;
    private List<Map<String, String>> youtubeVideos;
    private int currentPage;
    private int totalPages;
    private long totalItems;

    /** 부 구분이 있는 경우 (주일오전 1부/2부) */
    private Integer selectedServiceNumber;

    /** 예배 타입 구분이 있는 경우 (수요예배/금요기도회: wednesday/friday) */
    private String selectedType;
}
