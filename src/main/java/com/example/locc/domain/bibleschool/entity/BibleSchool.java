package com.example.locc.domain.bibleschool.entity;

import com.example.locc.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * BibleSchool(성경학교) 엔티티
 * - 정기적인 성경학교 정보
 * - YouTube 재생목록에서 최신 영상 정보 저장
 */
@Entity
@Table(name = "bible_school")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BibleSchool extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title; // 예: "2024 여름성경학교"

    @Column(length = 500)
    private String description; // 설명

    @Column(length = 255)
    private String youtubePlaylistId; // 유튜브 재생목록 ID

    @Column(length = 255)
    private String latestVideoId; // 최신 영상 ID (캐시용)

    @Column(length = 500)
    private String latestVideoTitle; // 최신 영상 제목 (캐시용)

    // 정적 팩토리 메서드
    public static BibleSchool create(String title, String youtubePlaylistId) {
        BibleSchool bibleSchool = new BibleSchool();
        bibleSchool.title = title;
        bibleSchool.youtubePlaylistId = youtubePlaylistId;
        return bibleSchool;
    }

    // 최신 영상 업데이트
    public void updateLatestVideo(String videoId, String videoTitle) {
        this.latestVideoId = videoId;
        this.latestVideoTitle = videoTitle;
    }

    // YouTube 재생목록 변경
    public void updateYoutubePlaylist(String youtubePlaylistId) {
        this.youtubePlaylistId = youtubePlaylistId;
    }
}
