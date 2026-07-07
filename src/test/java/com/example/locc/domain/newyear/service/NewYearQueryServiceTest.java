package com.example.locc.domain.newyear.service;

import com.example.locc.domain.newyear.dto.response.NewYearResponse;
import com.example.locc.domain.newyear.entity.NewYear;
import com.example.locc.domain.newyear.repository.NewYearRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

/**
 * NewYearQueryService 단위 테스트 (Mockito, DB 불필요)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("NewYearQueryService 단위 테스트")
class NewYearQueryServiceTest {

    @Mock private NewYearRepository newYearRepository;

    @InjectMocks private NewYearQueryService newYearQueryService;

    @Test
    @DisplayName("최신 조회 - 있으면 엔티티를 반환한다")
    void getLatest_found() {
        NewYear newYear = NewYear.create("2026 송구영신예배", "PL-1", 2026);
        given(newYearRepository.findFirstByOrderByYearDesc()).willReturn(Optional.of(newYear));

        assertThat(newYearQueryService.getLatest()).isSameAs(newYear);
    }

    @Test
    @DisplayName("최신 조회 - 없으면 null을 반환한다")
    void getLatest_notFound() {
        given(newYearRepository.findFirstByOrderByYearDesc()).willReturn(Optional.empty());

        assertThat(newYearQueryService.getLatest()).isNull();
    }

    @Test
    @DisplayName("최신 응답 조회 - 있으면 엔티티 기반 응답을 반환한다")
    void getLatestResponse_found() {
        NewYear newYear = NewYear.create("2026 송구영신예배", "PL-1", 2026);
        given(newYearRepository.findFirstByOrderByYearDesc()).willReturn(Optional.of(newYear));

        NewYearResponse response = newYearQueryService.getLatestResponse();

        assertThat(response.getTitle()).isEqualTo("2026 송구영신예배");
    }

    @Test
    @DisplayName("최신 응답 조회 - 레코드가 없으면 기본 응답(empty)을 반환한다")
    void getLatestResponse_empty() {
        given(newYearRepository.findFirstByOrderByYearDesc()).willReturn(Optional.empty());

        NewYearResponse response = newYearQueryService.getLatestResponse();

        assertThat(response.getTitle()).isEqualTo("송구영신예배");
    }

    @Test
    @DisplayName("연도별 조회 - 없으면 null을 반환한다")
    void getByYear_notFound() {
        given(newYearRepository.findByYear(2020)).willReturn(Optional.empty());

        assertThat(newYearQueryService.getByYear(2020)).isNull();
    }

    @Test
    @DisplayName("연도별 조회 - 있으면 엔티티를 반환한다")
    void getByYear_found() {
        NewYear newYear = NewYear.create("2025 송구영신예배", "PL-1", 2025);
        given(newYearRepository.findByYear(2025)).willReturn(Optional.of(newYear));

        assertThat(newYearQueryService.getByYear(2025)).isSameAs(newYear);
    }
}
