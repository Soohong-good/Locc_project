package com.example.locc.repository;

import com.example.locc.entity.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {

    /**
     * ID로 공지사항 조회 (작성자, 첨부파일 포함)
     */
    @Query("SELECT n FROM Notice n " +
           "LEFT JOIN FETCH n.createdBy " +
           "LEFT JOIN FETCH n.attachments " +
           "WHERE n.id = :id")
    Optional<Notice> findByIdWithAll(@Param("id") Long id);

    /**
     * 전체 공지사항 목록 (고정순 > 최신순) - 작성자 포함
     */
    @Query("SELECT DISTINCT n FROM Notice n " +
           "LEFT JOIN FETCH n.createdBy " +
           "ORDER BY n.isPinned DESC, n.createdAt DESC")
    List<Notice> findAll();

    /**
     * 전체 공지사항 페이징 (고정순 > 최신순) - 작성자 포함
     */
    @Query(value = "SELECT DISTINCT n FROM Notice n " +
                   "LEFT JOIN FETCH n.createdBy " +
                   "ORDER BY n.isPinned DESC, n.createdAt DESC",
           countQuery = "SELECT COUNT(n) FROM Notice n")
    Page<Notice> findAllPaged(Pageable pageable);

    /**
     * 고정된 공지사항 목록 - 작성자 포함
     */
    @Query("SELECT DISTINCT n FROM Notice n " +
           "LEFT JOIN FETCH n.createdBy " +
           "WHERE n.isPinned = true " +
           "ORDER BY n.createdAt DESC")
    List<Notice> findPinned();

    /**
     * 공지사항 검색 (제목, 내용) - 작성자 포함
     */
    @Query(value = "SELECT DISTINCT n FROM Notice n " +
                   "LEFT JOIN FETCH n.createdBy " +
                   "WHERE LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                   "LOWER(n.content) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                   "ORDER BY n.isPinned DESC, n.createdAt DESC",
           countQuery = "SELECT COUNT(n) FROM Notice n " +
                       "WHERE LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                       "LOWER(n.content) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Notice> search(@Param("keyword") String keyword, Pageable pageable);

    /**
     * 작성자별 공지사항 조회 - 작성자 포함
     */
    @Query("SELECT DISTINCT n FROM Notice n " +
           "LEFT JOIN FETCH n.createdBy " +
           "WHERE n.createdBy.email = :email " +
           "ORDER BY n.createdAt DESC")
    List<Notice> findByAuthor(@Param("email") String email);
}