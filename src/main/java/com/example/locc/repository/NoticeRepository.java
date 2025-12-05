package com.example.locc.repository;

import com.example.locc.entity.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {

    /**
     * 전체 공지사항 목록 (고정순 > 최신순)
     */
    @Query("SELECT n FROM Notice n ORDER BY n.isPinned DESC, n.createdAt DESC")
    List<Notice> findAll();

    /**
     * 전체 공지사항 페이징 (고정순 > 최신순)
     */
    @Query("SELECT n FROM Notice n ORDER BY n.isPinned DESC, n.createdAt DESC")
    Page<Notice> findAllPaged(Pageable pageable);

    /**
     * 고정된 공지사항 목록
     */
    @Query("SELECT n FROM Notice n WHERE n.isPinned = true ORDER BY n.createdAt DESC")
    List<Notice> findPinned();

    /**
     * 공지사항 검색 (제목, 내용)
     */
    @Query("SELECT n FROM Notice n WHERE " +
            "LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(n.content) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "ORDER BY n.isPinned DESC, n.createdAt DESC")
    Page<Notice> search(@Param("keyword") String keyword, Pageable pageable);

    /**
     * 작성자별 공지사항 조회
     */
    @Query("SELECT n FROM Notice n WHERE n.createdBy.email = :email ORDER BY n.createdAt DESC")
    List<Notice> findByAuthor(@Param("email") String email);
}