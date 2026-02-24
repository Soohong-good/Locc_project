package com.example.locc.domain.sermon.repository;

import com.example.locc.domain.sermon.entity.Sermon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Sermon Repository
 * - @EntityGraph로 N+1 해결 (선언적 fetch)
 * - 명확한 메서드명 사용
 */
public interface SermonRepository extends JpaRepository<Sermon, Long> {

    /**
     * 상세 조회 (작성자 정보 포함)
     */
    @EntityGraph(attributePaths = {"author"})
    @Query("SELECT s FROM Sermon s WHERE s.id = :id")
    Optional<Sermon> findDetailById(@Param("id") Long id);

    /**
     * 목록 조회 (작성자 정보 포함, 페이징)
     */
    @EntityGraph(attributePaths = {"author"})
    @Query("SELECT s FROM Sermon s ORDER BY s.sermonDate DESC, s.createdAt DESC")
    Page<Sermon> findList(Pageable pageable);

    /**
     * 검색 (제목 + 본문 + 설교자, 작성자 정보 포함, 페이징)
     */
    @EntityGraph(attributePaths = {"author"})
    @Query("SELECT s FROM Sermon s " +
           "WHERE s.title LIKE %:keyword% " +
           "   OR s.scripture LIKE %:keyword% " +
           "   OR s.preacher LIKE %:keyword% " +
           "ORDER BY s.sermonDate DESC, s.createdAt DESC")
    Page<Sermon> search(@Param("keyword") String keyword, Pageable pageable);

    /**
     * 카테고리별 조회 (serviceNumber 무관)
     */
    @EntityGraph(attributePaths = {"author"})
    @Query("SELECT s FROM Sermon s " +
           "WHERE s.category = :category " +
           "ORDER BY s.sermonDate DESC, s.createdAt DESC")
    Page<Sermon> findByCategory(@Param("category") String category, Pageable pageable);

    /**
     * 카테고리 + 부 구분 조회 (주일오전 1부/2부 등)
     * TEMPORARY: serviceNumber가 null인 경우도 포함하여 조회
     */
    @EntityGraph(attributePaths = {"author"})
    @Query("SELECT s FROM Sermon s " +
           "WHERE s.category = :category " +
           "  AND (s.serviceNumber = :serviceNumber OR s.serviceNumber IS NULL) " +
           "ORDER BY s.sermonDate DESC, s.createdAt DESC")
    Page<Sermon> findByCategoryAndServiceNumber(@Param("category") String category,
                                                  @Param("serviceNumber") Integer serviceNumber,
                                                  Pageable pageable);

    /**
     * 카테고리 + 부 구분 최신 조회
     * TEMPORARY: serviceNumber가 null인 경우도 포함하여 조회
     */
    @EntityGraph(attributePaths = {"author"})
    @Query("SELECT s FROM Sermon s " +
           "WHERE s.category = :category " +
           "  AND (s.serviceNumber = :serviceNumber OR s.serviceNumber IS NULL) " +
           "ORDER BY s.sermonDate DESC, s.createdAt DESC")
    List<Sermon> findLatestByCategoryAndServiceNumber(@Param("category") String category,
                                                        @Param("serviceNumber") Integer serviceNumber,
                                                        Pageable pageable);

    /**
     * 카테고리 + 검색
     */
    @EntityGraph(attributePaths = {"author"})
    @Query("SELECT s FROM Sermon s " +
           "WHERE s.category = :category " +
           "  AND (s.title LIKE %:keyword% " +
           "       OR s.scripture LIKE %:keyword% " +
           "       OR s.preacher LIKE %:keyword%) " +
           "ORDER BY s.sermonDate DESC, s.createdAt DESC")
    Page<Sermon> searchByCategory(@Param("category") String category, 
                                   @Param("keyword") String keyword, 
                                   Pageable pageable);

    /**
     * 최근 설교 조회
     */
    @EntityGraph(attributePaths = {"author"})
    @Query("SELECT s FROM Sermon s ORDER BY s.sermonDate DESC, s.createdAt DESC")
    List<Sermon> findLatest(Pageable pageable);

    /**
     * 특정 날짜 이후 생성된 설교 개수 (Admin용)
     */
    Long countByCreatedAtAfter(java.time.LocalDateTime dateTime);
}
