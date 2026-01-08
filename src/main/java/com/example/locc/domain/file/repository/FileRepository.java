package com.example.locc.domain.file.repository;

import com.example.locc.domain.file.entity.File;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * File Repository
 * - 파일 메타데이터 관리
 * - @EntityGraph로 uploadedBy fetch
 */
public interface FileRepository extends JpaRepository<File, Long> {

    /**
     * 특정 엔티티에 속한 모든 파일 조회
     */
    List<File> findByEntityTypeAndEntityId(File.EntityType entityType, Long entityId);

    /**
     * 특정 엔티티의 특정 카테고리 파일 조회
     */
    List<File> findByEntityTypeAndEntityIdAndCategory(
            File.EntityType entityType,
            Long entityId,
            File.FileCategory category
    );

    /**
     * 특정 엔티티에 속한 파일 개수 조회
     */
    long countByEntityTypeAndEntityId(File.EntityType entityType, Long entityId);

    /**
     * 특정 엔티티의 첫 번째 썸네일 조회
     */
    Optional<File> findFirstByEntityTypeAndEntityIdAndCategory(
            File.EntityType entityType,
            Long entityId,
            File.FileCategory category
    );

    /**
     * 특정 엔티티에 속한 모든 파일 삭제
     */
    void deleteByEntityTypeAndEntityId(File.EntityType entityType, Long entityId);

    /**
     * 업로더 정보와 함께 파일 조회 (N+1 방지)
     */
    @Query("SELECT f FROM File f LEFT JOIN FETCH f.uploadedBy WHERE f.id = :id")
    Optional<File> findByIdWithUploader(@Param("id") Long id);

    /**
     * 특정 엔티티의 파일들을 업로더 정보와 함께 조회
     */
    @Query("SELECT f FROM File f LEFT JOIN FETCH f.uploadedBy " +
            "WHERE f.entityType = :entityType AND f.entityId = :entityId " +
            "ORDER BY f.createdAt DESC")
    List<File> findByEntityTypeAndEntityIdWithUploader(
            @Param("entityType") File.EntityType entityType,
            @Param("entityId") Long entityId
    );

    /**
     * 여러 엔티티의 파일 개수를 한 번에 조회 (N+1 방지)
     * @return Map<entityId, count>
     */
    @Query("SELECT f.entityId, COUNT(f) FROM File f " +
            "WHERE f.entityType = :entityType AND f.entityId IN :entityIds " +
            "GROUP BY f.entityId")
    List<Object[]> countByEntityTypeAndEntityIdIn(
            @Param("entityType") File.EntityType entityType,
            @Param("entityIds") List<Long> entityIds
    );
}
