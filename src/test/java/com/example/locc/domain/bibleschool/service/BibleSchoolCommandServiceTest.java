package com.example.locc.domain.bibleschool.service;

import com.example.locc.domain.bibleschool.entity.BibleSchool;
import com.example.locc.domain.bibleschool.repository.BibleSchoolRepository;
import com.example.locc.domain.department.service.YouTubeService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

/**
 * BibleSchoolCommandService 단위 테스트 (Mockito, DB 불필요)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("BibleSchoolCommandService 단위 테스트")
class BibleSchoolCommandServiceTest {

    @Mock private BibleSchoolRepository bibleSchoolRepository;
    @Mock private YouTubeService youTubeService;

    @InjectMocks private BibleSchoolCommandService bibleSchoolCommandService;

    @Test
    @DisplayName("조회 또는 생성 - 이미 있으면 새로 생성하지 않는다")
    void getOrCreate_existing() {
        BibleSchool existing = BibleSchool.create("성경학교", "PL-existing");
        given(bibleSchoolRepository.findFirstByOrderByIdDesc()).willReturn(Optional.of(existing));

        BibleSchool result = bibleSchoolCommandService.getOrCreate();

        assertThat(result).isSameAs(existing);
        verify(bibleSchoolRepository, never()).save(any());
    }

    @Test
    @DisplayName("조회 또는 생성 - 없으면 기본값으로 새로 생성한다")
    void getOrCreate_createsNew() {
        given(bibleSchoolRepository.findFirstByOrderByIdDesc()).willReturn(Optional.empty());
        given(bibleSchoolRepository.save(any(BibleSchool.class))).willAnswer(inv -> inv.getArgument(0));

        BibleSchool result = bibleSchoolCommandService.getOrCreate();

        assertThat(result.getTitle()).isEqualTo("성경학교");
    }

    @Test
    @DisplayName("최신 영상 업데이트 - 재생목록 ID가 없으면 IllegalStateException")
    void updateLatestVideo_noPlaylistId() {
        BibleSchool bibleSchool = BibleSchool.create("성경학교", "");
        given(bibleSchoolRepository.findFirstByOrderByIdDesc()).willReturn(Optional.of(bibleSchool));

        assertThatThrownBy(() -> bibleSchoolCommandService.updateLatestVideo())
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("재생목록 ID");
    }

    @Test
    @DisplayName("최신 영상 업데이트 - 영상을 찾을 수 없으면 IllegalStateException")
    void updateLatestVideo_videoNotFound() {
        BibleSchool bibleSchool = BibleSchool.create("성경학교", "PL-1");
        given(bibleSchoolRepository.findFirstByOrderByIdDesc()).willReturn(Optional.of(bibleSchool));
        given(youTubeService.getLatestVideoFromPlaylist("PL-1")).willReturn(null);

        assertThatThrownBy(() -> bibleSchoolCommandService.updateLatestVideo())
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("영상을 찾을 수 없습니다");
    }

    @Test
    @DisplayName("최신 영상 업데이트 - 정상 케이스면 영상 정보가 반영되고 저장된다")
    void updateLatestVideo_success() {
        BibleSchool bibleSchool = BibleSchool.create("성경학교", "PL-1");
        given(bibleSchoolRepository.findFirstByOrderByIdDesc()).willReturn(Optional.of(bibleSchool));
        given(youTubeService.getLatestVideoFromPlaylist("PL-1"))
                .willReturn(new String[]{"video-1", "여름 성경학교"});

        bibleSchoolCommandService.updateLatestVideo();

        assertThat(bibleSchool.getLatestVideoId()).isEqualTo("video-1");
        assertThat(bibleSchool.getLatestVideoTitle()).isEqualTo("여름 성경학교");
        verify(bibleSchoolRepository).save(bibleSchool);
    }

    @Test
    @DisplayName("재생목록 ID 설정 - 갱신 후 저장한다")
    void updateYoutubePlaylist() {
        BibleSchool bibleSchool = BibleSchool.create("성경학교", "");
        given(bibleSchoolRepository.findFirstByOrderByIdDesc()).willReturn(Optional.of(bibleSchool));

        bibleSchoolCommandService.updateYoutubePlaylist("PL-new");

        assertThat(bibleSchool.getYoutubePlaylistId()).isEqualTo("PL-new");
        verify(bibleSchoolRepository).save(bibleSchool);
    }
}
