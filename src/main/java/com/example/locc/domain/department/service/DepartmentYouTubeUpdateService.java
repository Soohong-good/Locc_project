package com.example.locc.domain.department.service;

import com.example.locc.domain.department.entity.Department;
import com.example.locc.domain.department.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DepartmentYouTubeUpdateService {

    private final DepartmentRepository departmentRepository;
    private final YouTubeService youTubeService;

    // 중고등부: 채널 최신 영상이 라이브로 잡히는 문제로 재생목록에서 조회
    private static final String YOUTH_CODE        = "youth";
    private static final String YOUTH_PLAYLIST_ID = "PL0YvIuvg6pZ2A8eW2B03R2kMYM_SEtAGl";

    /**
     * 모든 부서의 최신 유튜브 영상 업데이트
     * 매일 오전 6시 실행
     */
    @Scheduled(cron = "0 0 6 * * *")
    @Transactional
    public void updateAllDepartmentVideos() {
        log.info("Starting YouTube video update for all departments");

        List<Department> departments = departmentRepository.findAll();
        int updateCount = 0;

        for (Department department : departments) {
            if (department.getYoutubeChannelId() != null && !department.getYoutubeChannelId().isEmpty()) {
                boolean updated = updateDepartmentVideo(department);
                if (updated) updateCount++;
            }
        }

        log.info("YouTube video update completed. Updated {} departments", updateCount);
    }

    /**
     * 특정 부서의 최신 유튜브 영상 업데이트
     * @param departmentCode 부서 코드
     */
    @Transactional
    public void updateDepartmentVideoByCode(String departmentCode) {
        log.info("Updating YouTube video for department: {}", departmentCode);

        Department department = departmentRepository.findByCode(departmentCode)
            .orElseThrow(() -> new IllegalArgumentException("부서를 찾을 수 없습니다: " + departmentCode));

        if (department.getYoutubeChannelId() == null || department.getYoutubeChannelId().isEmpty()) {
            log.warn("No YouTube channel ID set for department: {}", departmentCode);
            return;
        }

        updateDepartmentVideo(department);
    }

    /**
     * 부서의 최신 영상 업데이트 (내부 메서드)
     * 중고등부(youth)는 재생목록에서 조회하여 라이브 영상 문제를 방지
     */
    private boolean updateDepartmentVideo(Department department) {
        try {
            String[] videoInfo;

            if (YOUTH_CODE.equals(department.getCode())) {
                // 중고등부: 채널이 아닌 지정 재생목록에서 최신 영상 조회
                videoInfo = youTubeService.getLatestVideoFromPlaylist(YOUTH_PLAYLIST_ID);
                log.debug("youth: playlist 조회 사용 (playlistId={})", YOUTH_PLAYLIST_ID);
            } else {
                videoInfo = youTubeService.getLatestVideo(department.getYoutubeChannelId());
            }

            if (videoInfo != null && videoInfo.length == 2) {
                String videoId = videoInfo[0];
                String title   = videoInfo[1];

                department.updateLatestVideo(videoId, title);
                departmentRepository.save(department);

                log.info("Updated video for {}: {} ({})", department.getName(), title, videoId);
                return true;
            } else {
                log.warn("No video found for department: {}", department.getName());
                return false;
            }
        } catch (Exception e) {
            log.error("Error updating video for department: {}", department.getName(), e);
            return false;
        }
    }
}
