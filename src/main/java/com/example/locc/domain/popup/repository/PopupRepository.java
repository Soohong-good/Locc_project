package com.example.locc.domain.popup.repository;

import com.example.locc.domain.popup.entity.Popup;
import com.example.locc.domain.popup.entity.TargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 팝업 Repository
 */
public interface PopupRepository extends JpaRepository<Popup, Long> {

    /**
     * 현재 노출 가능한 팝업 조회 (우선순위 정렬)
     * - 활성화 상태
     * - 노출 기간 내
     * - 대상 조건 충족
     */
    @Query("""
        SELECT p FROM Popup p
        WHERE p.isActive = true
          AND p.displayStartDate <= :now
          AND p.displayEndDate >= :now
          AND (p.targetType = :targetAll 
               OR (p.targetType = :targetMember AND :isLoggedIn = true)
               OR (p.targetType = :targetGuest AND :isLoggedIn = false))
        ORDER BY p.priority DESC, p.createdAt DESC
    """)
    List<Popup> findActivePopups(
            @Param("now") LocalDateTime now,
            @Param("isLoggedIn") boolean isLoggedIn,
            @Param("targetAll") TargetType targetAll,
            @Param("targetMember") TargetType targetMember,
            @Param("targetGuest") TargetType targetGuest
    );

    /**
     * 전체 목록 조회 (관리자용 - 최신순)
     */
    List<Popup> findAllByOrderByCreatedAtDesc();

    /**
     * 활성화 상태별 조회
     */
    List<Popup> findByIsActiveOrderByPriorityDescCreatedAtDesc(Boolean isActive);
}
