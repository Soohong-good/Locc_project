package com.example.locc.domain.training.repository;

import com.example.locc.domain.training.entity.TrainingApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * TrainingApplication Repository
 */
public interface TrainingApplicationRepository extends JpaRepository<TrainingApplication, Long> {

    /**
     * 상세 조회 (훈련, 사용자 정보 포함)
     */
    @EntityGraph(attributePaths = {"training", "user"})
    @Query("SELECT a FROM TrainingApplication a WHERE a.id = :id")
    Optional<TrainingApplication> findDetailById(@Param("id") Long id);

    /**
     * 특정 훈련의 신청자 목록 (페이징)
     */
    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT a FROM TrainingApplication a " +
           "WHERE a.training.id = :trainingId " +
           "ORDER BY a.appliedAt DESC")
    Page<TrainingApplication> findByTrainingId(@Param("trainingId") Long trainingId, Pageable pageable);

    /**
     * 특정 훈련의 전체 신청자 목록 (엑셀용)
     */
    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT a FROM TrainingApplication a " +
           "WHERE a.training.id = :trainingId " +
           "ORDER BY a.appliedAt DESC")
    List<TrainingApplication> findAllByTrainingId(@Param("trainingId") Long trainingId);

    /**
     * 사용자의 신청 내역
     */
    @EntityGraph(attributePaths = {"training", "user"})
    @Query("SELECT a FROM TrainingApplication a " +
           "WHERE a.user.id = :userId " +
           "ORDER BY a.appliedAt DESC")
    List<TrainingApplication> findByUserId(@Param("userId") java.util.UUID userId);

    /**
     * 중복 신청 체크
     */
    @Query("SELECT COUNT(a) > 0 FROM TrainingApplication a " +
           "WHERE a.training.id = :trainingId AND a.user.id = :userId")
    boolean existsByTrainingIdAndUserId(
            @Param("trainingId") Long trainingId,
            @Param("userId") java.util.UUID userId
    );

    /**
     * 특정 훈련의 신청자 수
     */
    @Query("SELECT COUNT(a) FROM TrainingApplication a WHERE a.training.id = :trainingId")
    long countByTrainingId(@Param("trainingId") Long trainingId);
}
