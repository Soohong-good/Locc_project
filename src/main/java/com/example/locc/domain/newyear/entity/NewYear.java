package com.example.locc.domain.newyear.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * NewYear(송구영신예배) 엔티티
 * - 연 1회 송구영신예배 정보
 * - YouTube 재생목록에서 최신 영상 정보 저장
 * - 녹취본 저장
 */
@Entity
@Table(name = "newyear")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class NewYear {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title; // 예: "2024 송구영신예배"

    @Column(length = 500)
    private String description; // 설명

    @Column(length = 255)
    private String youtubePlaylistId; // 유튜브 재생목록 ID

    @Column(length = 255)
    private String latestVideoId; // 최신 영상 ID (캐시용)

    @Column(length = 500)
    private String latestVideoTitle; // 최신 영상 제목 (캐시용)

    @Column(nullable = false)
    private Integer year; // 연도 (예: 2024)

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String transcript; // 녹취본 전문

    @Column
    private Long pdfFileId; // 업로드된 설교 PDF 파일 ID (files 테이블 참조)

    // 정적 팩토리 메서드
    public static NewYear create(String title, String youtubePlaylistId, Integer year) {
        NewYear newYear = new NewYear();
        newYear.title = title;
        newYear.youtubePlaylistId = youtubePlaylistId;
        newYear.year = year;
        return newYear;
    }

    // 최신 영상 업데이트
    public void updateLatestVideo(String videoId, String videoTitle) {
        this.latestVideoId = videoId;
        this.latestVideoTitle = videoTitle;
    }

    // 제목 수정
    public void updateTitle(String title) {
        this.title = title;
    }

    // 설명 수정
    public void updateDescription(String description) {
        this.description = description;
    }

    // YouTube 재생목록 변경
    public void updateYoutubePlaylist(String youtubePlaylistId) {
        this.youtubePlaylistId = youtubePlaylistId;
    }

    // 녹취본 업데이트
    public void updateTranscript(String transcript) {
        this.transcript = transcript;
    }

    // PDF 파일 ID 업데이트
    public void updatePdfFileId(Long pdfFileId) {
        this.pdfFileId = pdfFileId;
    }
}
