package com.example.locc.domain.bibleschool.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.verify;

/**
 * BibleSchoolYouTubeUpdateService 단위 테스트 (Mockito, DB 불필요)
 * - 스케줄러가 예외로 죽지 않고 로그만 남기는지 검증한다.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("BibleSchoolYouTubeUpdateService 단위 테스트")
class BibleSchoolYouTubeUpdateServiceTest {

    @Mock private BibleSchoolCommandService bibleSchoolCommandService;

    @InjectMocks private BibleSchoolYouTubeUpdateService bibleSchoolYouTubeUpdateService;

    @Test
    @DisplayName("정상 케이스 - updateLatestVideo를 호출한다")
    void updateVideo_success() {
        bibleSchoolYouTubeUpdateService.updateVideo();

        verify(bibleSchoolCommandService).updateLatestVideo();
    }

    @Test
    @DisplayName("재생목록 미설정(IllegalStateException) - 예외를 삼키고 건너뛴다")
    void updateVideo_illegalStateExceptionSwallowed() {
        willThrow(new IllegalStateException("재생목록 ID 없음"))
                .given(bibleSchoolCommandService).updateLatestVideo();

        assertThatCode(() -> bibleSchoolYouTubeUpdateService.updateVideo()).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("예상치 못한 예외 - 삼키고 로그만 남긴다")
    void updateVideo_unexpectedExceptionSwallowed() {
        willThrow(new RuntimeException("YouTube API 장애"))
                .given(bibleSchoolCommandService).updateLatestVideo();

        assertThatCode(() -> bibleSchoolYouTubeUpdateService.updateVideo()).doesNotThrowAnyException();
    }
}
