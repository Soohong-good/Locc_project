package com.example.locc.domain.helprequest.service;

import com.example.locc.domain.helprequest.entity.HelpRequest;
import com.example.locc.domain.helprequest.entity.HelpRequestStatus;
import com.example.locc.domain.helprequest.repository.HelpRequestRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

/**
 * HelpRequestQueryService 단위 테스트 (Mockito, DB 불필요)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("HelpRequestQueryService 단위 테스트")
class HelpRequestQueryServiceTest {

    @Mock private HelpRequestRepository helpRequestRepository;

    @InjectMocks private HelpRequestQueryService helpRequestQueryService;

    private HelpRequest newHelpRequest() {
        return HelpRequest.create("홍길동", "010-1234-5678", "hong@test.com", "상담 요청합니다");
    }

    @Test
    @DisplayName("전체 목록 조회 - repository 결과를 매핑해 반환한다")
    void findAll() {
        given(helpRequestRepository.findAll(any(PageRequest.class)))
                .willReturn(new PageImpl<>(List.of(newHelpRequest())));

        Page<?> result = helpRequestQueryService.findAll(PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("상태별 목록 조회 - repository 결과를 매핑해 반환한다")
    void findByStatus() {
        given(helpRequestRepository.findByStatus(eq(HelpRequestStatus.PENDING), any()))
                .willReturn(new PageImpl<>(List.of(newHelpRequest())));

        Page<?> result = helpRequestQueryService.findByStatus(HelpRequestStatus.PENDING, PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("관리자용 목록 조회 - status가 없으면 전체 조회로 라우팅한다")
    void getList_withoutStatus_routesToFindAll() {
        given(helpRequestRepository.findAll(any(PageRequest.class))).willReturn(Page.empty());

        helpRequestQueryService.getList(null, 0, 10);

        verify(helpRequestRepository).findAll(any(PageRequest.class));
        verify(helpRequestRepository, never()).findByStatus(any(), any());
    }

    @Test
    @DisplayName("관리자용 목록 조회 - status가 있으면 상태별 조회로 라우팅한다")
    void getList_withStatus_routesToFindByStatus() {
        given(helpRequestRepository.findByStatus(eq(HelpRequestStatus.IN_PROGRESS), any()))
                .willReturn(Page.empty());

        helpRequestQueryService.getList(HelpRequestStatus.IN_PROGRESS, 0, 10);

        verify(helpRequestRepository).findByStatus(eq(HelpRequestStatus.IN_PROGRESS), any());
    }

    @Test
    @DisplayName("최근 목록 조회 - limit 만큼만 잘라서 반환한다")
    void findRecent_limitsResult() {
        given(helpRequestRepository.findTop10ByOrderByCreatedAtDesc())
                .willReturn(List.of(newHelpRequest(), newHelpRequest(), newHelpRequest()));

        List<?> result = helpRequestQueryService.findRecent(2);

        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("미처리 개수 - PENDING 상태 카운트를 반환한다")
    void countPending() {
        given(helpRequestRepository.countByStatus(HelpRequestStatus.PENDING)).willReturn(3L);

        assertThat(helpRequestQueryService.countPending()).isEqualTo(3L);
    }

    @Test
    @DisplayName("처리중 개수 - IN_PROGRESS 상태 카운트를 반환한다")
    void countInProgress() {
        given(helpRequestRepository.countByStatus(HelpRequestStatus.IN_PROGRESS)).willReturn(2L);

        assertThat(helpRequestQueryService.countInProgress()).isEqualTo(2L);
    }

    @Test
    @DisplayName("전체 개수 - repository.count()를 그대로 반환한다")
    void countAll() {
        given(helpRequestRepository.count()).willReturn(10L);

        assertThat(helpRequestQueryService.countAll()).isEqualTo(10L);
    }
}
