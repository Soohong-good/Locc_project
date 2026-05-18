package com.example.locc.domain.bibleschool.service;

import com.example.locc.domain.bibleschool.entity.BibleSchool;
import com.example.locc.domain.bibleschool.repository.BibleSchoolRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * BibleSchool Query Service
 * - 순수 조회 전용
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BibleSchoolQueryService {

    private final BibleSchoolRepository bibleSchoolRepository;

    /**
     * 가장 최근 성경학교 정보 조회
     */
    public BibleSchool getLatest() {
        return bibleSchoolRepository.findFirstByOrderByIdDesc()
                .orElse(null);
    }
}
