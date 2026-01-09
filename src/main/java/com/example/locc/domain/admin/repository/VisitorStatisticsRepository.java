package com.example.locc.domain.admin.repository;

import com.example.locc.domain.admin.entity.VisitorStatistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 방문자 통계 Repository
 * - Phase 4에서 사용
 */
public interface VisitorStatisticsRepository extends JpaRepository<VisitorStatistics, LocalDate> {
    
    /**
     * 특정 날짜의 통계 조회
     */
    Optional<VisitorStatistics> findByStatDate(LocalDate statDate);
    
    /**
     * 최근 통계 조회 (특정 날짜 이후)
     * Phase 4에서 주간 추이 그래프용
     */
    @Query("SELECT vs FROM VisitorStatistics vs " +
           "WHERE vs.statDate >= :fromDate " +
           "ORDER BY vs.statDate ASC")
    List<VisitorStatistics> findRecentStatistics(@Param("fromDate") LocalDate fromDate);
}
