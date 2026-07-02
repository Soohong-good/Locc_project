package com.example.locc.domain.choir.service;

import com.example.locc.config.YouTubeProperties;
import com.example.locc.domain.choir.entity.ChoirVideo;
import com.example.locc.domain.choir.repository.ChoirVideoRepository;
import com.example.locc.domain.department.service.YouTubeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 찬양대 YouTube 재생목록 동기화 서비스
 * - Sermon 도메인과 분리: 찬양대 영상은 설교가 아니므로 Sermon 카테고리 테이블을 오염시키지 않기 위함
 * - 2025-01-01 이후 게시된 영상만 동기화 대상
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChoirSyncService {

    private static final String PLAYLIST_KEY = "choir";
    private static final LocalDate SYNC_SINCE = LocalDate.of(2025, 1, 1);

    // 찬양대 분류 — 1부 찬양대는 "원니스"→"시온"으로 개명(2026년부터)되어 같은 카테고리로 통합
    private static final String CHOIR_SION = "시온찬양대";
    private static final String CHOIR_HALLELUJAH = "할렐루야찬양대";
    private static final String CHOIR_JUYOUNGGWANG = "주영광찬양대";
    // 시온/할렐루야/주영광 외 나머지는 전부 주일오후 예배 찬양대(미가엘/장로/대학청년/중창단 등 매주 바뀜)
    private static final String CHOIR_SUNDAY_AFTERNOON = "주일오후찬양대";

    private final YouTubeProperties youTubeProperties;
    private final YouTubeService youTubeService;
    private final ChoirVideoRepository choirVideoRepository;

    /**
     * 매주 월요일 03:00(KST) 자동 동기화 — 주일 설교 동기화와 동일한 주기
     */
    @Scheduled(cron = "0 0 3 * * MON", zone = "Asia/Seoul")
    @Transactional
    public void syncWeekly() {
        log.info("[찬양대 동기화] 주간 자동 동기화 시작");
        syncFromPlaylist();
        log.info("[찬양대 동기화] 주간 자동 동기화 완료");
    }

    /**
     * 재생목록 전체 동기화 (관리자 수동 트리거 / 스케줄러 공용)
     * @return 새로 생성된 영상 수
     */
    @Transactional
    public int syncFromPlaylist() {
        String playlistId = youTubeProperties.getPlaylistId(PLAYLIST_KEY);
        if (!StringUtils.hasText(playlistId)) {
            log.warn("[찬양대 동기화] 재생목록 ID 없음: key={}", PLAYLIST_KEY);
            return 0;
        }

        List<Map<String, String>> videos = youTubeService.getAllVideosFromPlaylistSince(playlistId, SYNC_SINCE);
        if (videos.isEmpty()) {
            log.warn("[찬양대 동기화] 영상 없음: playlistId={}", playlistId);
            return 0;
        }

        int created = 0;
        for (Map<String, String> video : videos) {
            String videoId = video.get("videoId");
            String title = video.get("title");
            String thumbnail = video.get("thumbnail");
            String publishedAt = video.get("publishedAt");

            if (!StringUtils.hasText(videoId) || choirVideoRepository.existsByYoutubeVideoId(videoId)) {
                log.debug("[찬양대 동기화] 이미 등록됨 또는 videoId 없음: videoId={}", videoId);
                continue;
            }

            LocalDate publishedDate = parseDateFromPublishedAt(publishedAt);
            String videoUrl = "https://www.youtube.com/watch?v=" + videoId;
            String choirName = classifyChoirName(title);

            ChoirVideo choirVideo = ChoirVideo.create(title, videoUrl, thumbnail, videoId, publishedDate, choirName);
            choirVideoRepository.save(choirVideo);
            log.info("[찬양대 동기화] 영상 생성: title={}, publishedAt={}", title, publishedDate);
            created++;
        }

        log.info("[찬양대 동기화] 완료: 신규 {}개", created);
        return created;
    }

    /**
     * 영상 제목으로 찬양대 분류
     * - "원니스"는 2026년부터 "시온"으로 개명된 동일 1부 찬양대라 시온찬양대로 통합
     * - 나머지(미가엘/장로/대학청년/중창단/호산나 등)는 전부 주일오후 예배 소속이라 주일오후찬양대로 통합
     */
    private String classifyChoirName(String title) {
        if (title.contains("원니스") || title.contains("시온")) return CHOIR_SION;
        if (title.contains("할렐루야")) return CHOIR_HALLELUJAH;
        if (title.contains("주영광")) return CHOIR_JUYOUNGGWANG;
        return CHOIR_SUNDAY_AFTERNOON;
    }

    private LocalDate parseDateFromPublishedAt(String publishedAt) {
        if (publishedAt == null || publishedAt.length() < 10) return null;
        try {
            return LocalDate.parse(publishedAt.substring(0, 10));
        } catch (Exception ignored) {
            return null;
        }
    }
}
