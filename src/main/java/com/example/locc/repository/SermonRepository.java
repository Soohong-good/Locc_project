package com.example.locc.repository;

import com.example.locc.entity.Sermon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SermonRepository extends JpaRepository<Sermon, Long> {

    /**
     * 전체 설교 목록 (최신순)
     */
    @Query("SELECT s FROM Sermon s ORDER BY s.sermonDate DESC")
    List<Sermon> findAll();

    /**
     * 전체 설교 페이징 (최신순)
     */
    @Query("SELECT s FROM Sermon s ORDER BY s.sermonDate DESC")
    Page<Sermon> findAllPaged(Pageable pageable);

    /**
     * 가장 최근 설교 1개
     */
    @Query("SELECT s FROM Sermon s ORDER BY s.sermonDate DESC")
    Optional<Sermon> findLatest();

    /**
     * 특정 설교자의 설교 목록 (최신순)
     */
    @Query("SELECT s FROM Sermon s WHERE s.preacher = :preacher ORDER BY s.sermonDate DESC")
    List<Sermon> findByPreacher(@Param("preacher") String preacher);

    /**
     * 특정 설교자의 설교 페이징 (최신순)
     */
    @Query("SELECT s FROM Sermon s WHERE s.preacher = :preacher ORDER BY s.sermonDate DESC")
    Page<Sermon> findByPreacherPaged(@Param("preacher") String preacher, Pageable pageable);

    /**
     * 설교 검색 (제목, 본문, 설교자)
     */
    @Query("SELECT s FROM Sermon s WHERE " +
            "LOWER(s.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.scripture) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.preacher) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "ORDER BY s.sermonDate DESC")
    Page<Sermon> search(@Param("keyword") String keyword, Pageable pageable);
}