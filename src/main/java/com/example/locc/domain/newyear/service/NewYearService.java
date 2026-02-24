package com.example.locc.domain.newyear.service;

import com.example.locc.domain.department.service.YouTubeService;
import com.example.locc.domain.newyear.entity.NewYear;
import com.example.locc.domain.newyear.repository.NewYearRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * NewYear Service
 * - 송구영신예배 정보 관리
 * - YouTube 영상 업데이트 (수동)
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NewYearService {

    private final NewYearRepository newYearRepository;
    private final YouTubeService youTubeService;

    /**
     * 가장 최근 송구영신예배 정보 조회
     */
    public NewYear getLatest() {
        return newYearRepository.findFirstByOrderByYearDesc()
                .orElse(null);
    }

    /**
     * 특정 연도 송구영신예배 조회
     */
    public NewYear getByYear(Integer year) {
        return newYearRepository.findByYear(year)
                .orElse(null);
    }

    /**
     * 현재 연도 송구영신예배 조회 (없으면 생성)
     */
    @Transactional
    public NewYear getCurrentOrCreate() {
        int currentYear = LocalDate.now().getYear();
        return newYearRepository.findByYear(currentYear)
                .orElseGet(() -> {
                    // 기본 데이터로 생성 (관리자가 나중에 수정)
                    NewYear newYear = NewYear.create(
                            currentYear + " 송구영신예배",
                            "", // 채널 ID는 관리자가 설정
                            currentYear
                    );
                    return newYearRepository.save(newYear);
                });
    }

    /**
     * YouTube 재생목록 최신 영상 업데이트 (관리자 수동 실행)
     */
    @Transactional
    public void updateLatestVideo() {
        NewYear newYear = getCurrentOrCreate();
        
        if (newYear.getYoutubePlaylistId() == null || newYear.getYoutubePlaylistId().isEmpty()) {
            log.warn("YouTube 재생목록 ID가 설정되지 않았습니다.");
            throw new IllegalStateException("YouTube 재생목록 ID를 먼저 설정해주세요.");
        }

        String[] videoInfo = youTubeService.getLatestVideoFromPlaylist(newYear.getYoutubePlaylistId());
        
        if (videoInfo != null && videoInfo.length == 2) {
            String videoId = videoInfo[0];
            String title = videoInfo[1];
            
            newYear.updateLatestVideo(videoId, title);
            newYearRepository.save(newYear);
            
            log.info("송구영신예배 최신 영상 업데이트 완료: {} ({})", title, videoId);
        } else {
            log.warn("송구영신예배 재생목록에서 영상을 찾을 수 없습니다.");
            throw new IllegalStateException("YouTube 재생목록에서 영상을 찾을 수 없습니다.");
        }
    }

    /**
     * YouTube 재생목록 ID 설정
     */
    @Transactional
    public void updateYoutubePlaylist(String youtubePlaylistId) {
        NewYear newYear = getCurrentOrCreate();
        newYear.updateYoutubePlaylist(youtubePlaylistId);
        newYearRepository.save(newYear);
        log.info("송구영신예배 YouTube 재생목록 ID 업데이트: {}", youtubePlaylistId);
    }

    /**
     * 제목 및 설명 업데이트
     */
    @Transactional
    public void updateInfo(String title, String description) {
        NewYear newYear = getCurrentOrCreate();
        newYear.updateTitle(title);
        newYear.updateDescription(description);
        newYearRepository.save(newYear);
        log.info("송구영신예배 정보 업데이트: {}", title);
    }

    /**
     * 녹취본 업데이트
     */
    @Transactional
    public void updateTranscript(String transcript) {
        NewYear newYear = getCurrentOrCreate();
        newYear.updateTranscript(transcript);
        newYearRepository.save(newYear);
        log.info("송구영신예배 녹취본 업데이트 완료");
    }
}
