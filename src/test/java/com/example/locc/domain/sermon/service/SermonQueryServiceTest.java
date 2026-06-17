package com.example.locc.domain.sermon.service;

import com.example.locc.config.YouTubeProperties;
import com.example.locc.domain.department.service.YouTubeService;
import com.example.locc.domain.file.service.FileQueryService;
import com.example.locc.domain.sermon.repository.SermonRepository;
import com.example.locc.exception.InvalidInputException;
import com.example.locc.exception.NotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

/**
 * SermonQueryService 단위 테스트 (Mockito, DB 불필요)
 * - 입력 검증 및 예외 경로 위주로 검증
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("SermonQueryService 단위 테스트")
class SermonQueryServiceTest {

    @Mock private SermonRepository sermonRepository;
    @Mock private FileQueryService fileQueryService;
    @Mock private YouTubeService youTubeService;
    @Mock private YouTubeProperties youTubeProperties;

    @InjectMocks private SermonQueryService sermonQueryService;

    @Test
    @DisplayName("주일오전 페이지 - 허용되지 않은 예배 번호면 InvalidInputException")
    void getSundayMorningPage_invalidServiceNumber() {
        assertThatThrownBy(() -> sermonQueryService.getSundayMorningPage(3, 0, 10))
                .isInstanceOf(InvalidInputException.class);
    }

    @Test
    @DisplayName("기타예배 페이지 - 허용되지 않은 타입이면 InvalidInputException")
    void getWeekdayPage_invalidType() {
        assertThatThrownBy(() -> sermonQueryService.getWeekdayPage("saturday", 0, 10, null))
                .isInstanceOf(InvalidInputException.class);
    }

    @Test
    @DisplayName("훈련용메시지 페이지 - 범위를 벗어난 번호면 InvalidInputException")
    void getTrainingMessagePage_outOfRange() {
        assertThatThrownBy(() -> sermonQueryService.getTrainingMessagePage(5, 0, 10))
                .isInstanceOf(InvalidInputException.class);
    }

    @Test
    @DisplayName("설교 상세 - 존재하지 않는 ID면 NotFoundException")
    void findDetail_notFound() {
        given(sermonRepository.findDetailById(999L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> sermonQueryService.findDetail(999L))
                .isInstanceOf(NotFoundException.class);
    }
}
