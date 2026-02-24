package com.example.locc.domain.bulletin.repository;

import com.example.locc.domain.bulletin.entity.Bulletin;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * Bulletin Repository
 * - @EntityGraph로 N+1 해결 (선언적 fetch)
 * - 명확한 메서드명 사용
 */
public interface BulletinRepository extends JpaRepository<Bulletin, Long> {

    /**
     * 상세 조회 (작성자 정보 포함)
     * - @EntityGraph로 author fetch
     */
    @EntityGraph(attributePaths = {"author"})
    @Query("SELECT b FROM Bulletin b WHERE b.id = :id")
    Optional<Bulletin> findDetailById(@Param("id") Long id);

    /**
     * 목록 조회 (작성자 정보 포함, 페이징)
     * - @EntityGraph로 author fetch
     */
    @EntityGraph(attributePaths = {"author"})
    @Query("SELECT b FROM Bulletin b ORDER BY b.createdAt DESC")
    Page<Bulletin> findList(Pageable pageable);

    /**
     * 검색 (제목 + 내용, 작성자 정보 포함, 페이징)
     * - @EntityGraph로 author fetch
     */
    @EntityGraph(attributePaths = {"author"})
    @Query("SELECT b FROM Bulletin b " +
           "WHERE b.title LIKE %:keyword% OR b.content LIKE %:keyword% " +
           "ORDER BY b.createdAt DESC")
    Page<Bulletin> search(@Param("keyword") String keyword, Pageable pageable);
}
