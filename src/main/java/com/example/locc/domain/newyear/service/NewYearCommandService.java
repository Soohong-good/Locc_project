package com.example.locc.domain.newyear.service;

import com.example.locc.config.YouTubeProperties;
import com.example.locc.domain.department.service.YouTubeService;
import com.example.locc.domain.file.entity.File;
import com.example.locc.domain.file.service.FileCommandService;
import com.example.locc.domain.newyear.entity.NewYear;
import com.example.locc.domain.newyear.repository.NewYearRepository;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

/**
 * NewYear Command Service
 * - 생성 / 수정 / 상태 변경
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NewYearCommandService {

    private final NewYearRepository newYearRepository;
    private final YouTubeService youTubeService;
    private final YouTubeProperties youTubeProperties;
    private final FileCommandService fileCommandService;
    private final UserRepository userRepository;

    private String getDefaultPlaylistId() {
        String id = youTubeProperties.getPlaylistId("newyear");
        return (id != null) ? id : "";
    }

    /**
     * 현재 연도 송구영신예배 조회 (없으면 생성)
     */
    public NewYear getCurrentOrCreate() {
        int currentYear = LocalDate.now().getYear();
        return newYearRepository.findByYear(currentYear)
                .orElseGet(() -> {
                    String playlistId = getDefaultPlaylistId();
                    NewYear newYear = NewYear.create(
                            currentYear + " 송구영신예배",
                            playlistId,
                            currentYear
                    );
                    log.info("송구영신예배 레코드 생성: {}년, playlistId={}",
                            currentYear, playlistId.isBlank() ? "(미설정)" : playlistId);
                    return newYearRepository.save(newYear);
                });
    }

    /**
     * YouTube 재생목록 최신 영상 업데이트 (관리자 수동 실행)
     */
    public void updateLatestVideo() {
        NewYear newYear = getCurrentOrCreate();

        String playlistId = (newYear.getYoutubePlaylistId() != null && !newYear.getYoutubePlaylistId().isBlank())
                ? newYear.getYoutubePlaylistId()
                : getDefaultPlaylistId();

        if (playlistId == null || playlistId.isBlank()) {
            throw new IllegalStateException(
                    "YouTube 재생목록 ID를 먼저 설정해주세요. " +
                    "(관리자 > 송구영신예배 > 재생목록 설정 또는 yml의 youtube.playlists.newyear)");
        }

        if (newYear.getYoutubePlaylistId() == null || newYear.getYoutubePlaylistId().isBlank()) {
            newYear.updateYoutubePlaylist(playlistId);
        }

        String[] videoInfo = youTubeService.getLatestVideoFromPlaylist(playlistId);

        if (videoInfo != null && videoInfo.length == 2) {
            newYear.updateLatestVideo(videoInfo[0], videoInfo[1]);
            newYearRepository.save(newYear);
            log.info("송구영신예배 최신 영상 업데이트 완료: {} ({})", videoInfo[1], videoInfo[0]);
        } else {
            log.warn("송구영신예배 재생목록에서 영상을 찾을 수 없습니다. playlistId={}", playlistId);
            throw new IllegalStateException("YouTube 재생목록에서 영상을 찾을 수 없습니다.");
        }
    }

    /**
     * YouTube 재생목록 ID 설정
     */
    public void updateYoutubePlaylist(String youtubePlaylistId) {
        NewYear newYear = getCurrentOrCreate();
        newYear.updateYoutubePlaylist(youtubePlaylistId);
        newYearRepository.save(newYear);
        log.info("송구영신예배 YouTube 재생목록 ID 업데이트: {}", youtubePlaylistId);
    }

    /**
     * 제목 및 설명 업데이트
     */
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
    public void updateTranscript(String transcript) {
        NewYear newYear = getCurrentOrCreate();
        newYear.updateTranscript(transcript);
        newYearRepository.save(newYear);
        log.info("송구영신예배 녹취본 업데이트 완료");
    }

    /**
     * 설교 PDF 업로드
     * - 기존 PDF가 있으면 삭제 후 새 파일로 교체
     */
    public void uploadPdf(MultipartFile pdfFile, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        NewYear newYear = getCurrentOrCreate();

        // 기존 PDF 삭제
        if (newYear.getPdfFileId() != null) {
            try {
                fileCommandService.deleteFile(newYear.getPdfFileId());
            } catch (Exception e) {
                log.warn("기존 PDF 삭제 실패 (무시): fileId={}", newYear.getPdfFileId());
            }
        }

        // 새 PDF 업로드
        File savedFile = fileCommandService.uploadFile(
                pdfFile,
                File.EntityType.NEWYEAR,
                newYear.getId(),
                File.FileCategory.ATTACHMENT,
                user
        );

        newYear.updatePdfFileId(savedFile.getId());
        newYearRepository.save(newYear);
        log.info("송구영신예배 PDF 업로드 완료: fileId={}", savedFile.getId());
    }
}
