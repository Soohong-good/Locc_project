package com.example.locc.domain.sermon.service;

import com.example.locc.config.YouTubeProperties;
import com.example.locc.domain.admin.entity.SermonPlaylistCache;
import com.example.locc.domain.admin.repository.SermonPlaylistCacheRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * 예배 재생목록 ID 결정 — 단일 출처
 *
 * 관리자 "API 설정"에서 저장한 값(sermon_playlist_cache.playlist_id_override)이 있으면 우선,
 * 없으면 application.yml(youtube.playlists) 기본값을 사용한다.
 * 동기화·최신 영상 갱신·예배 페이지 조회는 모두 이 클래스를 거쳐야 한다.
 */
@Component
@RequiredArgsConstructor
public class SermonPlaylistResolver {

    private final YouTubeProperties youTubeProperties;
    private final SermonPlaylistCacheRepository sermonPlaylistCacheRepository;

    public String resolve(String playlistKey) {
        String override = sermonPlaylistCacheRepository.findByPlaylistKey(playlistKey)
                .map(SermonPlaylistCache::getPlaylistIdOverride)
                .orElse(null);
        return StringUtils.hasText(override) ? override : youTubeProperties.getPlaylistId(playlistKey);
    }
}
