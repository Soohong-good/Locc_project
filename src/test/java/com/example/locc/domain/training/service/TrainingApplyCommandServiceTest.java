package com.example.locc.domain.training.service;

import com.example.locc.domain.training.dto.command.CreateApplicationCommand;
import com.example.locc.domain.training.entity.Training;
import com.example.locc.domain.training.entity.TrainingApplication;
import com.example.locc.domain.training.repository.TrainingApplicationRepository;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.exception.AccessDeniedException;
import com.example.locc.exception.InvalidInputException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

/**
 * TrainingApplyCommandService 단위 테스트 (Mockito, DB 불필요)
 * - 훈련 신청(미존재/마감/중복)과 취소(권한) 검증을 검증한다.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("TrainingApplyCommandService 단위 테스트")
class TrainingApplyCommandServiceTest {

    @Mock private TrainingApplicationRepository applicationRepository;
    @Mock private TrainingApplyQueryService applyQueryService;
    @Mock private TrainingQueryService trainingQueryService;
    @Mock private UserRepository userRepository;

    @InjectMocks private TrainingApplyCommandService trainingApplyCommandService;

    private CreateApplicationCommand sampleCommand() {
        return new CreateApplicationCommand(1L, "010-1234-5678", "CARD");
    }

    // ───────────── 신청 ─────────────

    @Test
    @DisplayName("신청 - 사용자가 없으면 UsernameNotFoundException")
    void apply_userNotFound() {
        given(userRepository.findByEmail("ghost@test.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> trainingApplyCommandService.apply(sampleCommand(), "ghost@test.com"))
                .isInstanceOf(UsernameNotFoundException.class);
        verify(applicationRepository, never()).save(any());
    }

    @Test
    @DisplayName("신청 - 신청 불가 상태(마감 등)면 InvalidInputException")
    void apply_cannotApply() {
        User user = mock(User.class);
        Training training = mock(Training.class);
        given(userRepository.findByEmail("u@test.com")).willReturn(Optional.of(user));
        given(trainingQueryService.findDetailById(1L)).willReturn(training);
        given(training.canApply()).willReturn(false);

        assertThatThrownBy(() -> trainingApplyCommandService.apply(sampleCommand(), "u@test.com"))
                .isInstanceOf(InvalidInputException.class);
        verify(applicationRepository, never()).save(any());
    }

    @Test
    @DisplayName("신청 - 이미 신청한 훈련이면 InvalidInputException")
    void apply_alreadyApplied() {
        UUID userId = UUID.randomUUID();
        User user = mock(User.class);
        Training training = mock(Training.class);
        given(userRepository.findByEmail("u@test.com")).willReturn(Optional.of(user));
        given(trainingQueryService.findDetailById(1L)).willReturn(training);
        given(training.canApply()).willReturn(true);
        given(user.getId()).willReturn(userId);
        given(applicationRepository.existsByTrainingIdAndUserId(1L, userId)).willReturn(true);

        assertThatThrownBy(() -> trainingApplyCommandService.apply(sampleCommand(), "u@test.com"))
                .isInstanceOf(InvalidInputException.class);
        verify(applicationRepository, never()).save(any());
    }

    // ───────────── 취소 ─────────────

    @Test
    @DisplayName("신청 취소 - 권한이 없으면 AccessDeniedException")
    void cancel_noPermission() {
        TrainingApplication application = mock(TrainingApplication.class);
        User user = mock(User.class);
        given(applyQueryService.findDetailById(5L)).willReturn(application);
        given(userRepository.findByEmail("u@test.com")).willReturn(Optional.of(user));
        given(application.canModify(user)).willReturn(false);

        assertThatThrownBy(() -> trainingApplyCommandService.cancel(5L, "u@test.com"))
                .isInstanceOf(AccessDeniedException.class);
        verify(applicationRepository, never()).delete(any());
    }

    @Test
    @DisplayName("신청 취소 - 권한이 있으면 신청을 삭제한다")
    void cancel_success() {
        TrainingApplication application = mock(TrainingApplication.class);
        User user = mock(User.class);
        given(applyQueryService.findDetailById(5L)).willReturn(application);
        given(userRepository.findByEmail("owner@test.com")).willReturn(Optional.of(user));
        given(application.canModify(user)).willReturn(true);

        trainingApplyCommandService.cancel(5L, "owner@test.com");

        verify(applicationRepository).delete(application);
    }
}
