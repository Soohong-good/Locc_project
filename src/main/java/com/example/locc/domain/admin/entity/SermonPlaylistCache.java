package com.example.locc.domain.admin.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 주일/기타예배 재생목록 최신 영상 캐시
 * - YouTube API 호출 결과를 DB에 저장해 새로고침 후에도 유지
 * - playlistKey: 'sunday-morning-1' | 'sunday-morning-2' | 'sunday-afternoon' | 'wednesday' | 'friday'
 */
@Entity
@Table(name = "sermon_playlist_cache")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SermonPlaylistCache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "playlist_key", nullable = false, unique = true, length = 50)
    private String playlistKey;

    @Column(name = "latest_video_id", length = 255)
    private String latestVideoId;

    @Column(name = "latest_video_title", length = 500)
    private String latestVideoTitle;

    public static SermonPlaylistCache create(String playlistKey) {
        SermonPlaylistCache cache = new SermonPlaylistCache();
        cache.playlistKey = playlistKey;
        return cache;
    }

    public void updateLatestVideo(String videoId, String videoTitle) {
        this.latestVideoId = videoId;
        this.latestVideoTitle = videoTitle;
    }
}
