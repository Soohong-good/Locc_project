package com.example.locc.domain.application.repository;

import com.example.locc.domain.application.entity.FacilityApplication;
import com.example.locc.domain.application.entity.FacilityApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FacilityApplicationRepository extends JpaRepository<FacilityApplication, Long> {

    @EntityGraph(attributePaths = {"category", "user"})
    Optional<FacilityApplication> findWithDetailById(Long id);

    @EntityGraph(attributePaths = {"category", "user"})
    @Query("""
            SELECT a FROM FacilityApplication a
            WHERE (:categoryId IS NULL OR a.category.id = :categoryId)
              AND (:status     IS NULL OR a.status     = :status)
            ORDER BY a.createdAt DESC
            """)
    Page<FacilityApplication> findAllForAdmin(
            @Param("categoryId") Long categoryId,
            @Param("status") FacilityApplicationStatus status,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"category"})
    Page<FacilityApplication> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    @EntityGraph(attributePaths = {"category", "user"})
    @Query("""
            SELECT a FROM FacilityApplication a
            WHERE (:categoryId IS NULL OR a.category.id = :categoryId)
              AND (:status     IS NULL OR a.status     = :status)
            ORDER BY a.createdAt DESC
            """)
    List<FacilityApplication> findAllForExcel(
            @Param("categoryId") Long categoryId,
            @Param("status") FacilityApplicationStatus status
    );
}
