package com.example.locc.domain.admin.service;

import com.example.locc.config.YouTubeProperties;
import com.example.locc.domain.admin.dto.response.BibleSchoolYouTubeStatus;
import com.example.locc.domain.admin.dto.response.SermonPlaylistStatus;
import com.example.locc.domain.admin.dto.response.WorshipYouTubeStatus;
import com.example.locc.domain.admin.entity.SermonPlaylistCache;
import com.example.locc.domain.admin.repository.SermonPlaylistCacheRepository;
import com.example.locc.domain.bibleschool.entity.BibleSchool;
import com.example.locc.domain.bibleschool.service.BibleSchoolQueryService;
import com.example.locc.domain.department.dto.response.DepartmentResponse;
import com.example.locc.domain.department.service.DepartmentQueryService;
import com.example.locc.domain.department.service.YouTubeService;
import com.example.locc.domain.newyear.dto.response.NewYearResponse;
import com.example.locc.domain.newyear.entity.NewYear;
import com.example.locc.domain.newyear.service.NewYearQueryService;
import com.example.locc.exception.InvalidInputException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 관리자 YouTube 현황 Query Service
 * - 부서 목록, 예배 현황, 재생목록 현황 조합 조회
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminYouTubeQueryService {

    private final DepartmentQueryService departmentQueryService;
    private final NewYearQueryService newYearQueryService;
    private final BibleSchoolQueryService bibleSchoolQueryService;
    private final YouTubeService youTubeService;
    private final YouTubeProperties youTubeProperties;
    private final SermonPlaylistCacheRepository sermonPlaylistCacheRepository;

    private static final List<String> PLAYLIST_ORDER = List.of(
            "sunday-morning-1", "sunday-morning-2",
            "sunday-afternoon", "wednesday", "friday"
    );

    private static final Map<String, String> WORSHIP_PLAYLIST_LABELS = Map.of(
            "sunday-morning-1", "주일오전 1부",
            "sunday-morning-2", "주일오전 2부",
            "sunday-afternoon", "주일오후",
            "wednesday",        "수요예배",
            "friday",           "금요기도회"
    );

    /**
     * 부서 전체 목록 (YouTube 현황 포함)
     */
    public List<DepartmentResponse> getDepartments() {
        return departmentQueryService.findAll();
    }

    /**
     * 예배 YouTube 현황 (송구영신예배 + 성경학교)
     */
    public WorshipYouTubeStatus getWorshipStatus() {
        NewYear newYear = newYearQueryService.getLatest();
        BibleSchool bibleSchool = bibleSchoolQueryService.getLatest();

        return new WorshipYouTubeStatus(
                newYear != null ? NewYearResponse.from(newYear) : NewYearResponse.empty(),
                bibleSchool != null ? BibleSchoolYouTubeStatus.from(bibleSchool) : BibleSchoolYouTubeStatus.empty()
        );
    }

    /**
     * 예배 재생목록 현황 목록 — DB 캐시에서 최신 영상 정보 포함하여 반환
     */
    public List<SermonPlaylistStatus> getSermonPlaylistStatuses() {
        // DB 캐시 맵 (key → cache)
        Map<String, SermonPlaylistCache> cacheMap = sermonPlaylistCacheRepository.findAll()
                .stream()
                .collect(Collectors.toMap(SermonPlaylistCache::getPlaylistKey, c -> c));

        return WORSHIP_PLAYLIST_LABELS.entrySet().stream()
                .map(entry -> {
                    String key = entry.getKey();
                    SermonPlaylistCache cache = cacheMap.get(key);
                    return new SermonPlaylistStatus(
                            key,
                            entry.getValue(),
                            youTubeProperties.getPlaylistId(key),
                            cache != null ? cache.getLatestVideoId() : null,
                            cache != null ? cache.getLatestVideoTitle() : null
                    );
                })
                .sorted((a, b) -> Integer.compare(
                        PLAYLIST_ORDER.indexOf(a.key()),
                        PLAYLIST_ORDER.indexOf(b.key())
                ))
                .collect(Collectors.toList());
    }

    public boolean isValidPlaylistKey(String playlistKey) {
        return WORSHIP_PLAYLIST_LABELS.containsKey(playlistKey);
    }

    public String getPlaylistLabel(String playlistKey) {
        return WORSHIP_PLAYLIST_LABELS.get(playlistKey);
    }

    public String getPlaylistId(String playlistKey) {
        return youTubeProperties.getPlaylistId(playlistKey);
    }

    /**
     * 특정 예배 재생목록 최신 영상 수동 갱신 — YouTube API 호출 후 DB 캐시에 저장
     */
    @Transactional
    public SermonPlaylistStatus refreshSermonPlaylist(String playlistKey) {
        if (!isValidPlaylistKey(playlistKey)) {
            throw new InvalidInputException("지원하지 않는 재생목록 키입니다: " + playlistKey);
        }

        String playlistId = getPlaylistId(playlistKey);
        if (playlistId == null || playlistId.isBlank()) {
            throw new InvalidInputException("재생목록 ID가 설정되지 않았습니다 (application.yml 확인)");
        }

        String[] info = youTubeService.getLatestVideoFromPlaylist(playlistId);

        String videoId    = info != null ? info[0] : null;
        String videoTitle = info != null ? info[1] : null;
        String label      = getPlaylistLabel(playlistKey);

        // DB 캐시 저장 (없으면 생성, 있으면 업데이트)
        SermonPlaylistCache cache = sermonPlaylistCacheRepository.findByPlaylistKey(playlistKey)
                .orElseGet(() -> SermonPlaylistCache.create(playlistKey));
        cache.updateLatestVideo(videoId, videoTitle);
        sermonPlaylistCacheRepository.save(cache);

        return new SermonPlaylistStatus(playlistKey, label, playlistId, videoId, videoTitle);
    }
}

