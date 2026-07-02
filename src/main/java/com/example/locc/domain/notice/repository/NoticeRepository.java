package com.example.locc.domain.notice.repository;

import com.example.locc.domain.notice.entity.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Notice Repository
 * - @EntityGraph로 N+1 해결 (선언적 fetch)
 * - 명확한 메서드명 사용
 */
public interface NoticeRepository extends JpaRepository<Notice, Long> {

    /**
     * 상세 조회 (작성자 정보 포함)
     * - @EntityGraph로 author fetch
     */
    @EntityGraph(attributePaths = {"author"})
    @Query("SELECT n FROM Notice n WHERE n.id = :id")
    Optional<Notice> findDetailById(@Param("id") Long id);

    /**
     * 목록 조회 (작성자 정보 포함, 페이징)
     * - @EntityGraph로 author fetch
     * - countQuery 자동 생성 (별도 지정 불필요)
     */
    @EntityGraph(attributePaths = {"author"})
    @Query("SELECT n FROM Notice n ORDER BY n.isPinned DESC, n.createdAt DESC")
    Page<Notice> findList(Pageable pageable);

    /**
     * 검색 (제목 + 내용, 작성자 정보 포함, 페이징)
     * - @EntityGraph로 author fetch
     */
    @EntityGraph(attributePaths = {"author"})
    @Query("SELECT n FROM Notice n " +
           "WHERE n.title LIKE %:keyword% OR n.content LIKE %:keyword% " +
           "ORDER BY n.isPinned DESC, n.createdAt DESC")
    Page<Notice> search(@Param("keyword") String keyword, Pageable pageable);

    /**
     * 고정된 공지사항 조회
     * - @EntityGraph로 author fetch
     */
    @EntityGraph(attributePaths = {"author"})
    @Query("SELECT n FROM Notice n " +
           "WHERE n.isPinned = true " +
           "ORDER BY n.createdAt DESC")
    List<Notice> findPinnedNotices();

    /**
     * 비고정 공지사항 최근 N개 조회
     * - @EntityGraph로 author fetch
     */
    @EntityGraph(attributePaths = {"author"})
    @Query("SELECT n FROM Notice n " +
           "WHERE n.isPinned = false " +
           "ORDER BY n.createdAt DESC")
    Page<Notice> findUnpinnedList(Pageable pageable);

    /**
     * 특정 날짜 이후 생성된 공지사항 개수 (Admin용)
     */
    Long countByCreatedAtAfter(java.time.LocalDateTime dateTime);

    /**
     * 관리자용 전체 공지사항 목록 조회 (고정/비고정 모두 포함)
     * - @EntityGraph로 author fetch
     * - 고정 우선, 최신순 정렬
     */
    @EntityGraph(attributePaths = {"author"})
    @Query("SELECT n FROM Notice n ORDER BY n.isPinned DESC, n.createdAt DESC")
    Page<Notice> findAllForAdmin(Pageable pageable);

    /**
     * 이전 글(작성일 기준 직전) 1건 — 상세 페이지 "이전 글" 네비게이션용
     * - 고정글(isPinned=true)은 목록 상단에 별도 고정되는 항목이라 네비게이션 대상에서 제외
     */
    @Query("SELECT n FROM Notice n WHERE n.isPinned = false AND n.createdAt < :createdAt ORDER BY n.createdAt DESC, n.id DESC")
    List<Notice> findPrevNotices(@Param("createdAt") java.time.LocalDateTime createdAt, Pageable pageable);

    /**
     * 다음 글(작성일 기준 직후) 1건 — 상세 페이지 "다음 글" 네비게이션용
     * - 고정글(isPinned=true)은 목록 상단에 별도 고정되는 항목이라 네비게이션 대상에서 제외
     */
    @Query("SELECT n FROM Notice n WHERE n.isPinned = false AND n.createdAt > :createdAt ORDER BY n.createdAt ASC, n.id ASC")
    List<Notice> findNextNotices(@Param("createdAt") java.time.LocalDateTime createdAt, Pageable pageable);
}
