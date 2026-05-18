package com.example.locc.domain.newyear.service;

import com.example.locc.domain.newyear.dto.response.NewYearResponse;
import com.example.locc.domain.newyear.entity.NewYear;
import com.example.locc.domain.newyear.repository.NewYearRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * NewYear Query Service
 * - 순수 조회 전용
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NewYearQueryService {

    private final NewYearRepository newYearRepository;

    /**
     * 가장 최근 송구영신예배 정보 조회
     */
    public NewYear getLatest() {
        return newYearRepository.findFirstByOrderByYearDesc()
                .orElse(null);
    }

    /**
     * 가장 최근 송구영신예배 Response 조회
     * - DB에 레코드가 없으면 empty() 반환 (null 반환 없음)
     */
    public NewYearResponse getLatestResponse() {
        NewYear newYear = newYearRepository.findFirstByOrderByYearDesc()
                .orElse(null);
        return newYear != null ? NewYearResponse.from(newYear) : NewYearResponse.empty();
    }

    /**
     * 특정 연도 송구영신예배 조회
     */
    public NewYear getByYear(Integer year) {
        return newYearRepository.findByYear(year)
                .orElse(null);
    }
}
