package com.example.locc.domain.praisesheet.repository;

import com.example.locc.domain.praisesheet.entity.PraiseSheet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PraiseSheetRepository extends JpaRepository<PraiseSheet, Long> {

    @EntityGraph(attributePaths = {"author"})
    @Query("SELECT p FROM PraiseSheet p WHERE p.id = :id")
    Optional<PraiseSheet> findDetailById(@Param("id") Long id);

    @EntityGraph(attributePaths = {"author"})
    @Query("SELECT p FROM PraiseSheet p ORDER BY p.isPinned DESC, p.createdAt DESC")
    Page<PraiseSheet> findList(Pageable pageable);

    @EntityGraph(attributePaths = {"author"})
    @Query("SELECT p FROM PraiseSheet p " +
           "WHERE p.title LIKE %:keyword% OR p.content LIKE %:keyword% " +
           "ORDER BY p.isPinned DESC, p.createdAt DESC")
    Page<PraiseSheet> search(@Param("keyword") String keyword, Pageable pageable);
}
