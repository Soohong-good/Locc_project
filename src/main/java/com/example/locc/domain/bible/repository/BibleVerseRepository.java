package com.example.locc.domain.bible.repository;

import com.example.locc.domain.bible.entity.BibleVerse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BibleVerseRepository extends JpaRepository<BibleVerse, Long> {

    /** 절 구간 조회 (예: 고후 9:1~15) */
    List<BibleVerse> findByBookAndChapterAndVerseBetweenOrderByVerseAsc(
            String book, int chapter, int startVerse, int endVerse);

    /** 장 전체 조회 (예: 고후 9장) */
    List<BibleVerse> findByBookAndChapterOrderByVerseAsc(String book, int chapter);
}
