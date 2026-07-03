package com.example.locc.domain.training.service;

import com.example.locc.domain.training.entity.TrainingApplication;
import com.example.locc.domain.training.repository.TrainingApplicationRepository;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
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
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

/**
 * TrainingApplyQueryService 단위 테스트 (Mockito, DB 불필요)
 * - 신청서 조회 NotFound, IDOR 방지(본인/관리자 검증), 목록·카운트 위임을 검증한다.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("TrainingApplyQueryService 단위 테스트")
class TrainingApplyQueryServiceTest {

    @Mock private TrainingApplicationRepository applicationRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private TrainingApplyQueryService trainingApplyQueryService;

    // ───────────── 단건 조회 ─────────────

    @Test
    @DisplayName("신청서 상세(내부) - 없으면 NotFoundException")
    void findDetailById_notFound() {
        given(applicationRepository.findDetailById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> trainingApplyQueryService.findDetailById(1L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("신청서 상세(내부) - 정상 시 TrainingApplication 반환")
    void findDetailById_returns() {
        TrainingApplication application = mock(TrainingApplication.class);
        given(applicationRepository.findDetailById(1L)).willReturn(Optional.of(application));

        assertThat(trainingApplyQueryService.findDetailById(1L)).isSameAs(application);
    }

    @Test
    @DisplayName("신청서 상세(API) - 없으면 NotFoundException")
    void getDetail_notFound() {
        given(applicationRepository.findDetailById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> trainingApplyQueryService.getDetail(1L))
                .isInstanceOf(NotFoundException.class);
    }

    // ───────────── IDOR 방지 (본인/관리자) ─────────────

    @Test
    @DisplayName("본인용 조회 - 신청서가 없으면 NotFoundException")
    void getDetailForUser_appNotFound() {
        given(applicationRepository.findDetailById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> trainingApplyQueryService.getDetailForUser(1L, "u@test.com"))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("본인용 조회 - 요청자가 없으면 NotFoundException")
    void getDetailForUser_requesterNotFound() {
        TrainingApplication application = mock(TrainingApplication.class);
        given(applicationRepository.findDetailById(1L)).willReturn(Optional.of(application));
        given(userRepository.findByEmail("u@test.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> trainingApplyQueryService.getDetailForUser(1L, "u@test.com"))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("본인용 조회 - 본인도 관리자도 아니면 AccessDeniedException")
    void getDetailForUser_forbidden() {
        TrainingApplication application = mock(TrainingApplication.class);
        User owner = mock(User.class);
        User requester = mock(User.class);
        given(applicationRepository.findDetailById(1L)).willReturn(Optional.of(application));
        given(userRepository.findByEmail("intruder@test.com")).willReturn(Optional.of(requester));
        given(application.getUser()).willReturn(owner);
        given(owner.getEmail()).willReturn("owner@test.com");
        given(requester.isAdmin()).willReturn(false);
        given(requester.isOperator()).willReturn(false);

        assertThatThrownBy(() -> trainingApplyQueryService.getDetailForUser(1L, "intruder@test.com"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("내 신청내역(이메일) - 사용자가 없으면 NotFoundException")
    void getMyApplicationsByEmail_userNotFound() {
        given(userRepository.findByEmail("ghost@test.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> trainingApplyQueryService.getMyApplicationsByEmail("ghost@test.com"))
                .isInstanceOf(NotFoundException.class);
    }

    // ───────────── 목록 / 카운트 위임 ─────────────

    @Test
    @DisplayName("훈련별 신청 목록 - findByTrainingId에 위임한다")
    void getListByTraining_delegates() {
        given(applicationRepository.findByTrainingId(eq(1L), any(Pageable.class))).willReturn(Page.empty());

        assertThat(trainingApplyQueryService.getListByTraining(1L, PageRequest.of(0, 10))).isEmpty();
        verify(applicationRepository).findByTrainingId(eq(1L), any(Pageable.class));
    }

    @Test
    @DisplayName("훈련별 전체 신청 - findAllByTrainingId에 위임한다")
    void getAllByTraining_delegates() {
        given(applicationRepository.findAllByTrainingId(1L)).willReturn(List.of());

        assertThat(trainingApplyQueryService.getAllByTraining(1L)).isEmpty();
        verify(applicationRepository).findAllByTrainingId(1L);
    }

    @Test
    @DisplayName("내 신청내역(userId) - findByUserId에 위임한다")
    void getMyApplications_delegates() {
        UUID userId = UUID.randomUUID();
        given(applicationRepository.findByUserId(userId)).willReturn(List.of());

        assertThat(trainingApplyQueryService.getMyApplications(userId)).isEmpty();
        verify(applicationRepository).findByUserId(userId);
    }

    @Test
    @DisplayName("훈련별 신청 수 - countByTrainingId 결과를 반환한다")
    void countByTraining_delegates() {
        given(applicationRepository.countByTrainingId(1L)).willReturn(5L);

        assertThat(trainingApplyQueryService.countByTraining(1L)).isEqualTo(5L);
    }

    @Test
    @DisplayName("참여 여부 - existsByTrainingIdAndUserId 결과를 반환한다")
    void canParticipate_delegates() {
        UUID userId = UUID.randomUUID();
        given(applicationRepository.existsByTrainingIdAndUserId(1L, userId)).willReturn(true);

        assertThat(trainingApplyQueryService.canParticipate(1L, userId)).isTrue();
    }
}
