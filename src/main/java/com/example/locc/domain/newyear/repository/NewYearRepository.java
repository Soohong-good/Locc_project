package com.example.locc.domain.newyear.repository;

import com.example.locc.domain.newyear.entity.NewYear;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * NewYear Repository
 */
public interface NewYearRepository extends JpaRepository<NewYear, Long> {

    /**
     * 연도로 송구영신예배 조회
     */
    Optional<NewYear> findByYear(Integer year);

    /**
     * 가장 최근 연도의 송구영신예배 조회
     */
    Optional<NewYear> findFirstByOrderByYearDesc();
}
