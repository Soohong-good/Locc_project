package com.example.locc.domain.newyear.service;

import com.example.locc.config.YouTubeProperties;
import com.example.locc.domain.department.service.YouTubeService;
import com.example.locc.domain.file.entity.File;
import com.example.locc.domain.file.service.FileCommandService;
import com.example.locc.domain.newyear.entity.NewYear;
import com.example.locc.domain.newyear.repository.NewYearRepository;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/**
 * NewYearCommandService 단위 테스트 (Mockito, DB 불필요)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("NewYearCommandService 단위 테스트")
class NewYearCommandServiceTest {

    @Mock private NewYearRepository newYearRepository;
    @Mock private YouTubeService youTubeService;
    @Mock private YouTubeProperties youTubeProperties;
    @Mock private FileCommandService fileCommandService;
    @Mock private UserRepository userRepository;

    @InjectMocks private NewYearCommandService newYearCommandService;

    @Test
    @DisplayName("현재연도 조회 - 이미 있으면 새로 생성하지 않는다")
    void getCurrentOrCreate_existing() {
        NewYear existing = NewYear.create("2026 송구영신예배", "PL-existing", LocalDate.now().getYear());
        given(newYearRepository.findByYear(anyInt())).willReturn(Optional.of(existing));

        NewYear result = newYearCommandService.getCurrentOrCreate();

        assertThat(result).isSameAs(existing);
        verify(newYearRepository, never()).save(any());
    }

    @Test
    @DisplayName("현재연도 조회 - 없으면 기본 재생목록 ID로 새로 생성한다")
    void getCurrentOrCreate_createsNew() {
        given(newYearRepository.findByYear(anyInt())).willReturn(Optional.empty());
        given(youTubeProperties.getPlaylistId("newyear")).willReturn("PL-default");
        given(newYearRepository.save(any(NewYear.class))).willAnswer(inv -> inv.getArgument(0));

        NewYear result = newYearCommandService.getCurrentOrCreate();

        assertThat(result.getYoutubePlaylistId()).isEqualTo("PL-default");
    }

    @Test
    @DisplayName("최신 영상 업데이트 - 재생목록 ID가 어디에도 없으면 IllegalStateException")
    void updateLatestVideo_noPlaylistId() {
        NewYear newYear = NewYear.create("title", null, LocalDate.now().getYear());
        given(newYearRepository.findByYear(anyInt())).willReturn(Optional.of(newYear));
        given(youTubeProperties.getPlaylistId("newyear")).willReturn(null);

        assertThatThrownBy(() -> newYearCommandService.updateLatestVideo())
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("재생목록 ID");
    }

    @Test
    @DisplayName("최신 영상 업데이트 - 영상을 찾을 수 없으면 IllegalStateException")
    void updateLatestVideo_videoNotFound() {
        NewYear newYear = NewYear.create("title", "PL-1", LocalDate.now().getYear());
        given(newYearRepository.findByYear(anyInt())).willReturn(Optional.of(newYear));
        given(youTubeService.getLatestVideoFromPlaylist("PL-1")).willReturn(null);

        assertThatThrownBy(() -> newYearCommandService.updateLatestVideo())
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("영상을 찾을 수 없습니다");
    }

    @Test
    @DisplayName("최신 영상 업데이트 - 정상 케이스면 영상 정보가 반영되고 저장된다")
    void updateLatestVideo_success() {
        NewYear newYear = NewYear.create("title", "PL-1", LocalDate.now().getYear());
        given(newYearRepository.findByYear(anyInt())).willReturn(Optional.of(newYear));
        given(youTubeService.getLatestVideoFromPlaylist("PL-1"))
                .willReturn(new String[]{"video-1", "새해 말씀"});

        newYearCommandService.updateLatestVideo();

        assertThat(newYear.getLatestVideoId()).isEqualTo("video-1");
        assertThat(newYear.getLatestVideoTitle()).isEqualTo("새해 말씀");
        verify(newYearRepository).save(newYear);
    }

    @Test
    @DisplayName("최신 영상 업데이트 - 엔티티에 재생목록 ID가 없으면 기본값으로 채워준다")
    void updateLatestVideo_fillsDefaultPlaylistWhenMissing() {
        NewYear newYear = NewYear.create("title", null, LocalDate.now().getYear());
        given(newYearRepository.findByYear(anyInt())).willReturn(Optional.of(newYear));
        given(youTubeProperties.getPlaylistId("newyear")).willReturn("PL-default");
        given(youTubeService.getLatestVideoFromPlaylist("PL-default"))
                .willReturn(new String[]{"video-1", "새해 말씀"});

        newYearCommandService.updateLatestVideo();

        assertThat(newYear.getYoutubePlaylistId()).isEqualTo("PL-default");
    }

    @Test
    @DisplayName("재생목록 ID 설정 - 갱신 후 저장한다")
    void updateYoutubePlaylist() {
        NewYear newYear = NewYear.create("title", null, LocalDate.now().getYear());
        given(newYearRepository.findByYear(anyInt())).willReturn(Optional.of(newYear));

        newYearCommandService.updateYoutubePlaylist("PL-new");

        assertThat(newYear.getYoutubePlaylistId()).isEqualTo("PL-new");
        verify(newYearRepository).save(newYear);
    }

    @Test
    @DisplayName("정보 업데이트 - 제목/설명이 반영되고 저장된다")
    void updateInfo() {
        NewYear newYear = NewYear.create("title", null, LocalDate.now().getYear());
        given(newYearRepository.findByYear(anyInt())).willReturn(Optional.of(newYear));

        newYearCommandService.updateInfo("새 제목", "새 설명");

        assertThat(newYear.getTitle()).isEqualTo("새 제목");
        assertThat(newYear.getDescription()).isEqualTo("새 설명");
    }

    @Test
    @DisplayName("녹취본 업데이트 - 반영되고 저장된다")
    void updateTranscript() {
        NewYear newYear = NewYear.create("title", null, LocalDate.now().getYear());
        given(newYearRepository.findByYear(anyInt())).willReturn(Optional.of(newYear));

        newYearCommandService.updateTranscript("녹취본 내용");

        assertThat(newYear.getTranscript()).isEqualTo("녹취본 내용");
    }

    @Test
    @DisplayName("성경 참조 업데이트 - 반영되고 저장된다")
    void updateScripture() {
        NewYear newYear = NewYear.create("title", null, LocalDate.now().getYear());
        given(newYearRepository.findByYear(anyInt())).willReturn(Optional.of(newYear));

        newYearCommandService.updateScripture("겔36:22-31");

        assertThat(newYear.getScripture()).isEqualTo("겔36:22-31");
    }

    @Test
    @DisplayName("PDF 업로드 - 사용자를 찾을 수 없으면 IllegalArgumentException")
    void uploadPdf_userNotFound() {
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.empty());
        MultipartFile file = mock(MultipartFile.class);

        assertThatThrownBy(() -> newYearCommandService.uploadPdf(file, "user@test.com"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("PDF 업로드 - 기존 PDF가 없으면 삭제 없이 바로 업로드한다")
    void uploadPdf_noExistingPdf() {
        User user = mock(User.class);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(user));
        NewYear newYear = NewYear.create("title", null, LocalDate.now().getYear());
        given(newYearRepository.findByYear(anyInt())).willReturn(Optional.of(newYear));
        File savedFile = mock(File.class);
        given(savedFile.getId()).willReturn(100L);
        given(fileCommandService.uploadFile(any(), eq(File.EntityType.NEWYEAR), any(), eq(File.FileCategory.ATTACHMENT), eq(user)))
                .willReturn(savedFile);
        MultipartFile file = mock(MultipartFile.class);

        newYearCommandService.uploadPdf(file, "user@test.com");

        verify(fileCommandService, never()).deleteFile(anyLong());
        assertThat(newYear.getPdfFileId()).isEqualTo(100L);
    }

    @Test
    @DisplayName("PDF 업로드 - 기존 PDF가 있으면 삭제 후 새로 업로드한다")
    void uploadPdf_replacesExisting() {
        User user = mock(User.class);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(user));
        NewYear newYear = NewYear.create("title", null, LocalDate.now().getYear());
        newYear.updatePdfFileId(50L);
        given(newYearRepository.findByYear(anyInt())).willReturn(Optional.of(newYear));
        File savedFile = mock(File.class);
        given(savedFile.getId()).willReturn(100L);
        given(fileCommandService.uploadFile(any(), eq(File.EntityType.NEWYEAR), any(), eq(File.FileCategory.ATTACHMENT), eq(user)))
                .willReturn(savedFile);
        MultipartFile file = mock(MultipartFile.class);

        newYearCommandService.uploadPdf(file, "user@test.com");

        verify(fileCommandService, times(1)).deleteFile(50L);
        assertThat(newYear.getPdfFileId()).isEqualTo(100L);
    }

    @Test
    @DisplayName("PDF 업로드 - 기존 PDF 삭제가 실패해도 무시하고 새 파일 업로드를 계속한다")
    void uploadPdf_deleteFailureIgnored() {
        User user = mock(User.class);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(user));
        NewYear newYear = NewYear.create("title", null, LocalDate.now().getYear());
        newYear.updatePdfFileId(50L);
        given(newYearRepository.findByYear(anyInt())).willReturn(Optional.of(newYear));
        org.mockito.Mockito.doThrow(new RuntimeException("파일 없음")).when(fileCommandService).deleteFile(50L);
        File savedFile = mock(File.class);
        given(savedFile.getId()).willReturn(100L);
        given(fileCommandService.uploadFile(any(), eq(File.EntityType.NEWYEAR), any(), eq(File.FileCategory.ATTACHMENT), eq(user)))
                .willReturn(savedFile);
        MultipartFile file = mock(MultipartFile.class);

        newYearCommandService.uploadPdf(file, "user@test.com");

        assertThat(newYear.getPdfFileId()).isEqualTo(100L);
    }
}
