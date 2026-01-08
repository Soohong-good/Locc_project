package com.example.locc.domain.staff.repository;

import com.example.locc.domain.staff.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Staff Repository
 * - Staff는 작성자 연관이 없어서 @EntityGraph 불필요
 * - 표시 순서대로 정렬
 */
public interface StaffRepository extends JpaRepository<Staff, Long> {

    /**
     * 전체 Staff 조회 (표시 순서대로)
     */
    @Query("SELECT s FROM Staff s ORDER BY s.displayOrder ASC")
    List<Staff> findAllOrdered();

    /**
     * 직분별 Staff 조회 (표시 순서대로)
     */
    @Query("SELECT s FROM Staff s WHERE s.position = :position ORDER BY s.displayOrder ASC")
    List<Staff> findByPosition(@Param("position") Staff.StaffPosition position);

    /**
     * 카테고리별 Staff 조회 (표시 순서대로)
     */
    @Query("SELECT s FROM Staff s WHERE s.category = :category ORDER BY s.displayOrder ASC")
    List<Staff> findByCategory(@Param("category") Staff.StaffCategory category);

    /**
     * 담임목사 조회
     */
    @Query("SELECT s FROM Staff s WHERE s.isSeniorPastor = true")
    List<Staff> findSeniorPastors();

    /**
     * 설교자 목록 조회 (담임목사, 목사, 전도사만)
     * - PASTOR 또는 EVANGELIST
     * - 담임목사 → 목사 → 전도사 순서로 정렬
     */
    @Query("SELECT s FROM Staff s " +
           "WHERE s.position IN ('PASTOR', 'EVANGELIST') " +
           "ORDER BY " +
           "CASE " +
           "  WHEN s.isSeniorPastor = true THEN 1 " +
           "  WHEN s.position = 'PASTOR' THEN 2 " +
           "  WHEN s.position = 'EVANGELIST' THEN 3 " +
           "END, " +
           "s.displayOrder ASC")
    List<Staff> findPreachers();
}
