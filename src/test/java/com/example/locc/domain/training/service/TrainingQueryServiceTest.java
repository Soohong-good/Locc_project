package com.example.locc.domain.training.service;

import com.example.locc.domain.training.entity.Training;
import com.example.locc.domain.training.entity.TrainingStatus;
import com.example.locc.domain.training.repository.TrainingRepository;
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
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

/**
 * TrainingQueryService 단위 테스트 (Mockito, DB 불필요)
 * - 상세 조회 NotFound, 목록/검색의 repository 위임을 검증한다.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("TrainingQueryService 단위 테스트")
class TrainingQueryServiceTest {

    @Mock private TrainingRepository trainingRepository;

    @InjectMocks private TrainingQueryService trainingQueryService;

    @Test
    @DisplayName("상세 조회(내부) - 없으면 NotFoundException")
    void findDetailById_notFound() {
        given(trainingRepository.findDetailById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> trainingQueryService.findDetailById(1L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("상세 조회(내부) - 정상 시 Training 반환")
    void findDetailById_returns() {
        Training training = mock(Training.class);
        given(trainingRepository.findDetailById(1L)).willReturn(Optional.of(training));

        assertThat(trainingQueryService.findDetailById(1L)).isSameAs(training);
    }

    @Test
    @DisplayName("상세 조회(API) - 없으면 NotFoundException")
    void getDetail_notFound() {
        given(trainingRepository.findDetailById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> trainingQueryService.getDetail(1L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("목록 조회 - repository.findList에 위임한다")
    void getList_delegates() {
        given(trainingRepository.findList(any(Pageable.class))).willReturn(Page.empty());

        assertThat(trainingQueryService.getList(PageRequest.of(0, 10))).isEmpty();
        verify(trainingRepository).findList(any(Pageable.class));
    }

    @Test
    @DisplayName("상태별 목록 - 전달한 상태로 findByStatus에 위임한다")
    void getListByStatus_delegates() {
        given(trainingRepository.findByStatus(eq(TrainingStatus.OPEN), any(Pageable.class))).willReturn(Page.empty());

        trainingQueryService.getListByStatus(TrainingStatus.OPEN, PageRequest.of(0, 10));

        verify(trainingRepository).findByStatus(eq(TrainingStatus.OPEN), any(Pageable.class));
    }

    @Test
    @DisplayName("신청 가능 목록 - findOpenTrainings 결과를 반환한다")
    void getOpenTrainings_delegates() {
        given(trainingRepository.findOpenTrainings()).willReturn(List.of());

        assertThat(trainingQueryService.getOpenTrainings()).isEmpty();
        verify(trainingRepository).findOpenTrainings();
    }

    @Test
    @DisplayName("검색 - 키워드로 search에 위임한다")
    void search_delegates() {
        given(trainingRepository.search(eq("제자"), any(Pageable.class))).willReturn(Page.empty());

        trainingQueryService.search("제자", PageRequest.of(0, 10));

        verify(trainingRepository).search(eq("제자"), any(Pageable.class));
    }
}
