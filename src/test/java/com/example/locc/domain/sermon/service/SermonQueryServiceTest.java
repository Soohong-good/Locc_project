package com.example.locc.domain.sermon.service;

import com.example.locc.config.YouTubeProperties;
import com.example.locc.domain.department.service.YouTubeService;
import com.example.locc.domain.file.service.FileQueryService;
import com.example.locc.domain.sermon.dto.response.SermonPageResponse;
import com.example.locc.domain.sermon.entity.Sermon;
import com.example.locc.domain.sermon.repository.SermonRepository;
import com.example.locc.exception.InvalidInputException;
import com.example.locc.exception.NotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;

/**
 * SermonQueryService 단위 테스트 (Mockito, DB 불필요)
 * - 입력 검증, 예외 경로, 통합 조회(aggregation) happy-path를 검증한다.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("SermonQueryService 단위 테스트")
class SermonQueryServiceTest {

    @Mock private SermonRepository sermonRepository;
    @Mock private FileQueryService fileQueryService;
    @Mock private YouTubeService youTubeService;
    @Mock private YouTubeProperties youTubeProperties;

    @InjectMocks private SermonQueryService sermonQueryService;

    // ───────────── 입력 검증 ─────────────

    @Test
    @DisplayName("주일오전 페이지 - 허용되지 않은 예배 번호면 InvalidInputException")
    void getSundayMorningPage_invalidServiceNumber() {
        assertThatThrownBy(() -> sermonQueryService.getSundayMorningPage(3, 0, 10, null))
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
        assertThatThrownBy(() -> sermonQueryService.getTrainingMessagePage(0, 0, 10))
                .isInstanceOf(InvalidInputException.class);
    }

    // ───────────── 예외 경로 ─────────────

    @Test
    @DisplayName("설교 상세 - 존재하지 않는 ID면 NotFoundException")
    void findDetail_notFound() {
        given(sermonRepository.findDetailById(999L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> sermonQueryService.findDetail(999L))
                .isInstanceOf(NotFoundException.class);
    }

    // ───────────── happy-path ─────────────

    @Test
    @DisplayName("카테고리별 최신 1건 - 결과가 없으면 null을 반환한다")
    void findLatestOneByCategory_empty_returnsNull() {
        given(sermonRepository.findByCategory("주일오후", PageRequest.of(0, 1)))
                .willReturn(Page.empty());

        assertThat(sermonQueryService.findLatestOneByCategory("주일오후")).isNull();
    }

    @Test
    @DisplayName("수요예배 통합 조회 - 빈 데이터에서도 응답을 정상 조립한다")
    void getWeekdayPage_wednesday_returnsAggregatedResponse() {
        // wednesday → 카테고리 "수요예배" (serviceNumber 없이 카테고리로만 구분)
        given(youTubeProperties.getPlaylistId("wednesday")).willReturn(null); // 유튜브 없음
        // toPageable()이 정렬 조건을 붙이므로 페이지 세부값 대신 any(Pageable)로 매칭
        given(sermonRepository.findByCategory(eq("수요예배"), any(Pageable.class)))
                .willReturn(Page.empty());

        SermonPageResponse result = sermonQueryService.getWeekdayPage("wednesday", 0, 10, null);

        assertThat(result.getSelectedType()).isEqualTo("wednesday");
        assertThat(result.getSermons()).isEmpty();
        assertThat(result.getLatestSermon()).isNull();
        assertThat(result.getTotalItems()).isZero();
    }

    @Test
    @DisplayName("훈련용메시지 통합 조회 - 유효 번호면 응답을 정상 조립한다")
    void getTrainingMessagePage_valid_returnsResponse() {
        given(sermonRepository.findByCategoryAndServiceNumberExact("훈련용메시지", 1, PageRequest.of(0, 10)))
                .willReturn(Page.empty());
        given(sermonRepository.findLatestByCategoryAndServiceNumberExact("훈련용메시지", 1, PageRequest.of(0, 1)))
                .willReturn(List.<Sermon>of());

        SermonPageResponse result = sermonQueryService.getTrainingMessagePage(1, 0, 10);

        assertThat(result.getSelectedServiceNumber()).isEqualTo(1);
        assertThat(result.getSermons()).isEmpty();
    }

    @Test
    @DisplayName("최근 N일 설교 개수 - 레포지토리 카운트를 그대로 반환한다")
    void countRecent_returnsRepositoryCount() {
        given(sermonRepository.countByCreatedAtAfter(any())).willReturn(3L);

        assertThat(sermonQueryService.countRecent(7)).isEqualTo(3L);
    }
}
