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
}
