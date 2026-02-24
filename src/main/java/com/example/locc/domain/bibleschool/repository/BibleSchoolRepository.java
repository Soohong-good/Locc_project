package com.example.locc.domain.bibleschool.repository;

import com.example.locc.domain.bibleschool.entity.BibleSchool;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * BibleSchool Repository
 */
public interface BibleSchoolRepository extends JpaRepository<BibleSchool, Long> {

    /**
     * 가장 최근 성경학교 조회 (ID 기준)
     */
    Optional<BibleSchool> findFirstByOrderByIdDesc();
}
