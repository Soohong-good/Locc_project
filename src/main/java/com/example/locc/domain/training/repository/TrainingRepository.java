package com.example.locc.domain.training.repository;

import com.example.locc.domain.training.entity.Training;
import com.example.locc.domain.training.entity.TrainingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Training Repository
 */
public interface TrainingRepository extends JpaRepository<Training, Long> {

    /**
     * 상세 조회 (작성자 정보 포함)
     */
    @EntityGraph(attributePaths = {"createdBy"})
    @Query("SELECT t FROM Training t WHERE t.id = :id")
    Optional<Training> findDetailById(@Param("id") Long id);

    /**
     * 목록 조회 (작성자 정보 포함, 페이징)
     * - 최신순 정렬
     */
    @EntityGraph(attributePaths = {"createdBy"})
    @Query("SELECT t FROM Training t ORDER BY t.createdAt DESC")
    Page<Training> findList(Pageable pageable);

    /**
     * 상태별 목록 조회
     */
    @EntityGraph(attributePaths = {"createdBy"})
    @Query("SELECT t FROM Training t WHERE t.status = :status ORDER BY t.createdAt DESC")
    Page<Training> findByStatus(@Param("status") TrainingStatus status, Pageable pageable);

    /**
     * 신청 가능한 훈련 목록 (OPEN 상태)
     */
    @EntityGraph(attributePaths = {"createdBy"})
    @Query("SELECT t FROM Training t " +
           "WHERE t.status = 'OPEN' " +
           "AND t.applicationDeadline > CURRENT_TIMESTAMP " +
           "ORDER BY t.startDate ASC")
    List<Training> findOpenTrainings();

    /**
     * 검색 (제목, 설명)
     */
    @EntityGraph(attributePaths = {"createdBy"})
    @Query("SELECT t FROM Training t " +
           "WHERE t.title LIKE %:keyword% OR t.description LIKE %:keyword% " +
           "ORDER BY t.createdAt DESC")
    Page<Training> search(@Param("keyword") String keyword, Pageable pageable);
}
