package com.example.locc.domain.bibleschool.service;

import com.example.locc.domain.bibleschool.entity.BibleSchool;
import com.example.locc.domain.bibleschool.repository.BibleSchoolRepository;
import com.example.locc.domain.department.service.YouTubeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * BibleSchool Command Service
 * - 생성 / 수정 / 상태 변경
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class BibleSchoolCommandService {

    private final BibleSchoolRepository bibleSchoolRepository;
    private final YouTubeService youTubeService;

    /**
     * 성경학교 정보 조회 (없으면 생성)
     */
    public BibleSchool getOrCreate() {
        return bibleSchoolRepository.findFirstByOrderByIdDesc()
                .orElseGet(() -> {
                    BibleSchool bibleSchool = BibleSchool.create(
                            "성경학교",
                            ""
                    );
                    return bibleSchoolRepository.save(bibleSchool);
                });
    }

    /**
     * YouTube 재생목록 최신 영상 업데이트 (스케줄러 또는 수동)
     */
    public void updateLatestVideo() {
        BibleSchool bibleSchool = getOrCreate();

        if (bibleSchool.getYoutubePlaylistId() == null || bibleSchool.getYoutubePlaylistId().isEmpty()) {
            log.warn("성경학교 YouTube 재생목록 ID가 설정되지 않았습니다.");
            throw new IllegalStateException("YouTube 재생목록 ID를 먼저 설정해주세요.");
        }

        String[] videoInfo = youTubeService.getLatestVideoFromPlaylist(bibleSchool.getYoutubePlaylistId());

        if (videoInfo != null && videoInfo.length == 2) {
            String videoId = videoInfo[0];
            String title = videoInfo[1];
            bibleSchool.updateLatestVideo(videoId, title);
            bibleSchoolRepository.save(bibleSchool);
            log.info("성경학교 최신 영상 업데이트 완료: {} ({})", title, videoId);
        } else {
            log.warn("성경학교 재생목록에서 영상을 찾을 수 없습니다.");
            throw new IllegalStateException("YouTube 재생목록에서 영상을 찾을 수 없습니다.");
        }
    }

    /**
     * YouTube 재생목록 ID 설정
     */
    public void updateYoutubePlaylist(String youtubePlaylistId) {
        BibleSchool bibleSchool = getOrCreate();
        bibleSchool.updateYoutubePlaylist(youtubePlaylistId);
        bibleSchoolRepository.save(bibleSchool);
        log.info("성경학교 YouTube 재생목록 ID 업데이트: {}", youtubePlaylistId);
    }

    /**
     * 제목 및 설명 업데이트
     */
    public void updateInfo(String title, String description) {
        BibleSchool bibleSchool = getOrCreate();
        bibleSchool.updateTitle(title);
        bibleSchool.updateDescription(description);
        bibleSchoolRepository.save(bibleSchool);
        log.info("성경학교 정보 업데이트: {}", title);
    }
}
