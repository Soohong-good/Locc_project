package com.example.locc.domain.bibleschool.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * BibleSchool YouTube 자동 업데이트 Service
 * - 매주 토요일 낮 12시 자동 업데이트
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BibleSchoolYouTubeUpdateService {

    private final BibleSchoolService bibleSchoolService;

    /**
     * 성경학교 최신 유튜브 영상 자동 업데이트
     * 매주 토요일 낮 12시 실행
     */
    @Scheduled(cron = "0 0 12 * * SAT")
    @Transactional
    public void updateVideo() {
        log.info("[성경학교] YouTube 최신 영상 자동 업데이트 시작 (매주 토요일)");
        
        try {
            bibleSchoolService.updateLatestVideo();
            log.info("[성경학교] YouTube 최신 영상 자동 업데이트 완료");
        } catch (IllegalStateException e) {
            log.warn("[성경학교] YouTube 영상 업데이트 건너뜀: {}", e.getMessage());
        } catch (Exception e) {
            log.error("[성경학교] YouTube 영상 자동 업데이트 실패", e);
        }
    }
}
