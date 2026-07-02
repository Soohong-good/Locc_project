package com.example.locc.domain.bible.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 성경 본문 절 (읽기 전용 참조 데이터)
 * - 기존 `bible_verse` 테이블 사용: book(약칭: 창/고후) · chapter · verse · text
 * - UNIQUE(book, chapter, verse) 인덱스 활용
 */
@Entity
@Table(name = "bible_verse")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BibleVerse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 책 약칭 (창, 출, 고후 ...) */
    @Column(nullable = false, length = 10)
    private String book;

    @Column(nullable = false)
    private int chapter;

    @Column(nullable = false)
    private int verse;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String text;
}
