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
     * 카테고리 + 부 구분 조회 (주일오전 1부/2부, 기타예배 수요/금요)
     * serviceNumber가 null인 경우도 포함 — 기존 데이터 호환용
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
     * serviceNumber가 null인 경우도 포함 — 기존 데이터 호환용
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
     * 카테고리 + serviceNumber 정확히 일치 조회 (훈련메시지 탭 구분용)
     */
    @EntityGraph(attributePaths = {"author"})
    @Query("SELECT s FROM Sermon s " +
           "WHERE s.category = :category " +
           "  AND s.serviceNumber = :serviceNumber " +
           "ORDER BY s.sermonDate DESC, s.createdAt DESC")
    Page<Sermon> findByCategoryAndServiceNumberExact(@Param("category") String category,
                                                       @Param("serviceNumber") Integer serviceNumber,
                                                       Pageable pageable);

    /**
     * 카테고리 + serviceNumber 정확히 일치 최신 조회 (훈련메시지 탭 구분용)
     */
    @EntityGraph(attributePaths = {"author"})
    @Query("SELECT s FROM Sermon s " +
           "WHERE s.category = :category " +
           "  AND s.serviceNumber = :serviceNumber " +
           "ORDER BY s.sermonDate DESC, s.createdAt DESC")
    List<Sermon> findLatestByCategoryAndServiceNumberExact(@Param("category") String category,
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

    // ─────────────────────────────────────────────
    // 주일오전 날짜 기반 그룹핑 조회
    // ─────────────────────────────────────────────

    /**
     * 카테고리별 중복 없는 날짜 목록 (최신순 페이징, 제목 검색 옵션)
     * - 주일오전 그룹핑 리스트용 (관리자 검색 포함)
     * - keyword: null이면 전체, 있으면 해당 날짜의 1부/2부 중 하나라도 제목 매칭 시 날짜 포함
     * - countQuery 명시: DISTINCT 쿼리에서 Spring Data JPA 자동 파생 count가 전체 행 수를 반환할 수 있음
     */
    @Query(value = "SELECT DISTINCT s.sermonDate FROM Sermon s WHERE s.category = :category AND s.sermonDate IS NOT NULL AND (:keyword IS NULL OR s.title LIKE CONCAT('%', :keyword, '%')) ORDER BY s.sermonDate DESC",
           countQuery = "SELECT COUNT(DISTINCT s.sermonDate) FROM Sermon s WHERE s.category = :category AND s.sermonDate IS NOT NULL AND (:keyword IS NULL OR s.title LIKE CONCAT('%', :keyword, '%'))")
    Page<java.time.LocalDate> findDistinctDatesByCategory(@Param("category") String category,
                                                          @Param("keyword") String keyword,
                                                          Pageable pageable);

    /**
     * 카테고리 + 날짜 IN 조회 (author fetch join, serviceNumber 오름차순)
     * - null serviceNumber는 1부로 취급 (COALESCE)
     */
    @EntityGraph(attributePaths = {"author"})
    @Query("SELECT s FROM Sermon s WHERE s.category = :category AND s.sermonDate IN :dates ORDER BY s.sermonDate DESC, COALESCE(s.serviceNumber, 1) ASC")
    List<Sermon> findByCategoryAndDateIn(@Param("category") String category,
                                         @Param("dates") List<java.time.LocalDate> dates);

    /**
     * 카테고리 + 단일 날짜 조회 (상세용)
     */
    @EntityGraph(attributePaths = {"author"})
    @Query("SELECT s FROM Sermon s WHERE s.category = :category AND s.sermonDate = :date ORDER BY COALESCE(s.serviceNumber, 1) ASC")
    List<Sermon> findByCategoryAndDate(@Param("category") String category,
                                       @Param("date") java.time.LocalDate date);

    /**
     * 특정 날짜 이후 생성된 설교 개수 (Admin용)
     */
    Long countByCreatedAtAfter(java.time.LocalDateTime dateTime);

    // ─────────────────────────────────────────────
    // YouTube 자동 동기화용
    // ─────────────────────────────────────────────

    /**
     * YouTube 영상 ID 중복 체크
     */
    boolean existsByYoutubeVideoId(String youtubeVideoId);

    /**
     * 카테고리 + 날짜 + 부 중복 체크 (serviceNumber non-null: 주일오전 1·2부)
     */
    boolean existsByCategoryAndSermonDateAndServiceNumber(String category,
                                                          java.time.LocalDate sermonDate,
                                                          Integer serviceNumber);

    /**
     * 카테고리 + 날짜 중복 체크 (serviceNumber null: 주일오후·수요·금요)
     */
    boolean existsByCategoryAndSermonDate(String category, java.time.LocalDate sermonDate);
}
