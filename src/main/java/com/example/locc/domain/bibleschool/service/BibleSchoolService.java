package com.example.locc.domain.bibleschool.service;

import com.example.locc.domain.bibleschool.entity.BibleSchool;
import com.example.locc.domain.bibleschool.repository.BibleSchoolRepository;
import com.example.locc.domain.department.service.YouTubeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * BibleSchool Service
 * - 성경학교 정보 관리
 * - YouTube 영상 업데이트 (자동 스케줄러)
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BibleSchoolService {

    private final BibleSchoolRepository bibleSchoolRepository;
    private final YouTubeService youTubeService;

    /**
     * 가장 최근 성경학교 정보 조회
     */
    public BibleSchool getLatest() {
        return bibleSchoolRepository.findFirstByOrderByIdDesc()
                .orElse(null);
    }

    /**
     * 성경학교 정보 조회 (없으면 생성)
     */
    @Transactional
    public BibleSchool getOrCreate() {
        return bibleSchoolRepository.findFirstByOrderByIdDesc()
                .orElseGet(() -> {
                    // 기본 데이터로 생성 (관리자가 나중에 수정)
                    BibleSchool bibleSchool = BibleSchool.create(
                            "성경학교",
                            "" // 채널 ID는 관리자가 설정
                    );
                    return bibleSchoolRepository.save(bibleSchool);
                });
    }

    /**
     * YouTube 재생목록 최신 영상 업데이트 (스케줄러 또는 수동)
     */
    @Transactional
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
    @Transactional
    public void updateYoutubePlaylist(String youtubePlaylistId) {
        BibleSchool bibleSchool = getOrCreate();
        bibleSchool.updateYoutubePlaylist(youtubePlaylistId);
        bibleSchoolRepository.save(bibleSchool);
        log.info("성경학교 YouTube 재생목록 ID 업데이트: {}", youtubePlaylistId);
    }

    /**
     * 제목 및 설명 업데이트
     */
    @Transactional
    public void updateInfo(String title, String description) {
        BibleSchool bibleSchool = getOrCreate();
        bibleSchool.updateTitle(title);
        bibleSchool.updateDescription(description);
        bibleSchoolRepository.save(bibleSchool);
        log.info("성경학교 정보 업데이트: {}", title);
    }
}
