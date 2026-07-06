package com.example.locc.domain.choir.service;

import com.example.locc.config.YouTubeProperties;
import com.example.locc.domain.choir.entity.ChoirVideo;
import com.example.locc.domain.choir.repository.ChoirVideoRepository;
import com.example.locc.domain.department.service.YouTubeService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/**
 * ChoirSyncService 단위 테스트 (Mockito, DB/YouTube API 불필요)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ChoirSyncService 단위 테스트")
class ChoirSyncServiceTest {

    @Mock private YouTubeProperties youTubeProperties;
    @Mock private YouTubeService youTubeService;
    @Mock private ChoirVideoRepository choirVideoRepository;

    @InjectMocks private ChoirSyncService choirSyncService;

    private Map<String, String> video(String videoId, String title, String publishedAt) {
        Map<String, String> map = new HashMap<>();
        map.put("videoId", videoId);
        map.put("title", title);
        map.put("thumbnail", "thumb.jpg");
        map.put("publishedAt", publishedAt);
        return map;
    }

    @Test
    @DisplayName("재생목록 ID가 없으면 동기화 없이 0을 반환한다")
    void syncFromPlaylist_noPlaylistId() {
        given(youTubeProperties.getPlaylistId("choir")).willReturn(null);

        int result = choirSyncService.syncFromPlaylist();

        assertThat(result).isZero();
        verify(youTubeService, never()).getAllVideosFromPlaylistSince(anyString(), any());
    }

    @Test
    @DisplayName("영상이 없으면 0을 반환한다")
    void syncFromPlaylist_noVideos() {
        given(youTubeProperties.getPlaylistId("choir")).willReturn("PL123");
        given(youTubeService.getAllVideosFromPlaylistSince(eq("PL123"), any())).willReturn(List.of());

        int result = choirSyncService.syncFromPlaylist();

        assertThat(result).isZero();
    }

    @Test
    @DisplayName("이미 등록된 videoId는 건너뛴다")
    void syncFromPlaylist_skipsExisting() {
        given(youTubeProperties.getPlaylistId("choir")).willReturn("PL123");
        given(youTubeService.getAllVideosFromPlaylistSince(eq("PL123"), any()))
                .willReturn(List.of(video("abc", "시온찬양대 찬양", "2026-01-05T00:00:00Z")));
        given(choirVideoRepository.existsByYoutubeVideoId("abc")).willReturn(true);

        int result = choirSyncService.syncFromPlaylist();

        assertThat(result).isZero();
        verify(choirVideoRepository, never()).save(any());
    }

    @Test
    @DisplayName("videoId가 없는 항목은 건너뛴다")
    void syncFromPlaylist_skipsBlankVideoId() {
        given(youTubeProperties.getPlaylistId("choir")).willReturn("PL123");
        given(youTubeService.getAllVideosFromPlaylistSince(eq("PL123"), any()))
                .willReturn(List.of(video("", "제목", "2026-01-05T00:00:00Z")));

        int result = choirSyncService.syncFromPlaylist();

        assertThat(result).isZero();
        verify(choirVideoRepository, never()).save(any());
    }

    @Test
    @DisplayName("정상 신규 영상이면 저장되고 생성 개수가 반환된다")
    void syncFromPlaylist_createsNewVideo() {
        given(youTubeProperties.getPlaylistId("choir")).willReturn("PL123");
        given(youTubeService.getAllVideosFromPlaylistSince(eq("PL123"), any()))
                .willReturn(List.of(video("abc", "시온찬양대 찬양", "2026-01-05T00:00:00Z")));
        given(choirVideoRepository.existsByYoutubeVideoId("abc")).willReturn(false);

        int result = choirSyncService.syncFromPlaylist();

        assertThat(result).isEqualTo(1);
        ArgumentCaptor<ChoirVideo> captor = ArgumentCaptor.forClass(ChoirVideo.class);
        verify(choirVideoRepository).save(captor.capture());
        ChoirVideo saved = captor.getValue();
        assertThat(saved.getChoirName()).isEqualTo("시온찬양대");
        assertThat(saved.getPublishedAt()).isEqualTo(LocalDate.of(2026, 1, 5));
        assertThat(saved.getVideoUrl()).isEqualTo("https://www.youtube.com/watch?v=abc");
    }

    @Test
    @DisplayName("찬양대 분류 - 할렐루야 포함 제목은 할렐루야찬양대로 분류된다")
    void classifyChoirName_hallelujah() {
        given(youTubeProperties.getPlaylistId("choir")).willReturn("PL123");
        given(youTubeService.getAllVideosFromPlaylistSince(eq("PL123"), any()))
                .willReturn(List.of(video("v1", "할렐루야찬양대 특송", "2026-02-01T00:00:00Z")));

        choirSyncService.syncFromPlaylist();

        ArgumentCaptor<ChoirVideo> captor = ArgumentCaptor.forClass(ChoirVideo.class);
        verify(choirVideoRepository).save(captor.capture());
        assertThat(captor.getValue().getChoirName()).isEqualTo("할렐루야찬양대");
    }

    @Test
    @DisplayName("찬양대 분류 - 주영광 포함 제목은 주영광찬양대로 분류된다")
    void classifyChoirName_juyounggwang() {
        given(youTubeProperties.getPlaylistId("choir")).willReturn("PL123");
        given(youTubeService.getAllVideosFromPlaylistSince(eq("PL123"), any()))
                .willReturn(List.of(video("v1", "주영광찬양대 특송", "2026-02-01T00:00:00Z")));

        choirSyncService.syncFromPlaylist();

        ArgumentCaptor<ChoirVideo> captor = ArgumentCaptor.forClass(ChoirVideo.class);
        verify(choirVideoRepository).save(captor.capture());
        assertThat(captor.getValue().getChoirName()).isEqualTo("주영광찬양대");
    }

    @Test
    @DisplayName("찬양대 분류 - 원니스 포함 제목도 시온찬양대로 통합 분류된다")
    void classifyChoirName_oneness_mergedIntoSion() {
        given(youTubeProperties.getPlaylistId("choir")).willReturn("PL123");
        given(youTubeService.getAllVideosFromPlaylistSince(eq("PL123"), any()))
                .willReturn(List.of(video("v1", "원니스찬양대 특송", "2026-02-01T00:00:00Z")));

        choirSyncService.syncFromPlaylist();

        ArgumentCaptor<ChoirVideo> captor = ArgumentCaptor.forClass(ChoirVideo.class);
        verify(choirVideoRepository).save(captor.capture());
        assertThat(captor.getValue().getChoirName()).isEqualTo("시온찬양대");
    }

    @Test
    @DisplayName("찬양대 분류 - 그 외 제목은 주일오후찬양대로 분류된다")
    void classifyChoirName_others_fallbackToSundayAfternoon() {
        given(youTubeProperties.getPlaylistId("choir")).willReturn("PL123");
        given(youTubeService.getAllVideosFromPlaylistSince(eq("PL123"), any()))
                .willReturn(List.of(video("v1", "미가엘찬양대 특송", "2026-02-01T00:00:00Z")));

        choirSyncService.syncFromPlaylist();

        ArgumentCaptor<ChoirVideo> captor = ArgumentCaptor.forClass(ChoirVideo.class);
        verify(choirVideoRepository).save(captor.capture());
        assertThat(captor.getValue().getChoirName()).isEqualTo("주일오후찬양대");
    }

    @Test
    @DisplayName("publishedAt 형식이 올바르지 않으면 publishedDate는 null로 저장된다")
    void syncFromPlaylist_invalidPublishedAt_resultsInNullDate() {
        given(youTubeProperties.getPlaylistId("choir")).willReturn("PL123");
        given(youTubeService.getAllVideosFromPlaylistSince(eq("PL123"), any()))
                .willReturn(List.of(video("v1", "시온찬양대 특송", "invalid-date")));

        choirSyncService.syncFromPlaylist();

        ArgumentCaptor<ChoirVideo> captor = ArgumentCaptor.forClass(ChoirVideo.class);
        verify(choirVideoRepository).save(captor.capture());
        assertThat(captor.getValue().getPublishedAt()).isNull();
    }

    @Test
    @DisplayName("여러 영상 중 일부만 신규면 신규 개수만 생성된다")
    void syncFromPlaylist_multipleVideos_onlyNewCreated() {
        given(youTubeProperties.getPlaylistId("choir")).willReturn("PL123");
        given(youTubeService.getAllVideosFromPlaylistSince(eq("PL123"), any()))
                .willReturn(List.of(
                        video("existing", "시온찬양대 A", "2026-01-01T00:00:00Z"),
                        video("new1", "시온찬양대 B", "2026-01-02T00:00:00Z")
                ));
        given(choirVideoRepository.existsByYoutubeVideoId("existing")).willReturn(true);
        given(choirVideoRepository.existsByYoutubeVideoId("new1")).willReturn(false);

        int result = choirSyncService.syncFromPlaylist();

        assertThat(result).isEqualTo(1);
        verify(choirVideoRepository, times(1)).save(any());
    }
}
