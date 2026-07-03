package com.example.locc.domain.training.service;

import com.example.locc.domain.training.dto.command.CreateTrainingCommand;
import com.example.locc.domain.training.entity.Training;
import com.example.locc.domain.training.repository.TrainingRepository;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.exception.AccessDeniedException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

/**
 * TrainingCommandService 단위 테스트 (Mockito, DB 불필요)
 * - 훈련 생성/수정/삭제/마감의 사용자 조회·권한 검증을 검증한다.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("TrainingCommandService 단위 테스트")
class TrainingCommandServiceTest {

    @Mock private TrainingRepository trainingRepository;
    @Mock private TrainingQueryService trainingQueryService;
    @Mock private UserRepository userRepository;

    @InjectMocks private TrainingCommandService trainingCommandService;

    private CreateTrainingCommand sampleCreateCommand() {
        return new CreateTrainingCommand(
                "제자훈련", "설명",
                LocalDate.now(), LocalDate.now().plusDays(7),
                LocalDateTime.now().plusDays(3), 10000, 20);
    }

    // ───────────── 생성 ─────────────

    @Test
    @DisplayName("훈련 생성 - 작성자(사용자)가 없으면 UsernameNotFoundException")
    void create_userNotFound() {
        given(userRepository.findByEmail("ghost@test.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> trainingCommandService.create(sampleCreateCommand(), "ghost@test.com"))
                .isInstanceOf(UsernameNotFoundException.class);
        verify(trainingRepository, never()).save(any());
    }

    // ───────────── 수정 ─────────────

    @Test
    @DisplayName("훈련 수정 - 권한이 없으면 AccessDeniedException")
    void update_noPermission() {
        Training training = mock(Training.class);
        User user = mock(User.class);
        given(trainingQueryService.findDetailById(1L)).willReturn(training);
        given(userRepository.findByEmail("u@test.com")).willReturn(Optional.of(user));
        given(training.canModify(user)).willReturn(false);

        assertThatThrownBy(() -> trainingCommandService.update(1L, null, "u@test.com"))
                .isInstanceOf(AccessDeniedException.class);
        verify(training, never()).update(any(), any(), any(), any(), any(), anyInt(), anyInt());
    }

    // ───────────── 삭제 ─────────────

    @Test
    @DisplayName("훈련 삭제 - 권한이 없으면 AccessDeniedException")
    void delete_noPermission() {
        Training training = mock(Training.class);
        User user = mock(User.class);
        given(trainingQueryService.findDetailById(1L)).willReturn(training);
        given(userRepository.findByEmail("u@test.com")).willReturn(Optional.of(user));
        given(training.canModify(user)).willReturn(false);

        assertThatThrownBy(() -> trainingCommandService.delete(1L, "u@test.com"))
                .isInstanceOf(AccessDeniedException.class);
        verify(trainingRepository, never()).delete(any());
    }

    @Test
    @DisplayName("훈련 삭제 - 권한이 있으면 repository.delete 호출")
    void delete_success() {
        Training training = mock(Training.class);
        User user = mock(User.class);
        given(trainingQueryService.findDetailById(1L)).willReturn(training);
        given(userRepository.findByEmail("admin@test.com")).willReturn(Optional.of(user));
        given(training.canModify(user)).willReturn(true);

        trainingCommandService.delete(1L, "admin@test.com");

        verify(trainingRepository).delete(training);
    }

    // ───────────── 마감 ─────────────

    @Test
    @DisplayName("신청 마감 - 권한이 없으면 AccessDeniedException")
    void close_noPermission() {
        Training training = mock(Training.class);
        User user = mock(User.class);
        given(trainingQueryService.findDetailById(1L)).willReturn(training);
        given(userRepository.findByEmail("u@test.com")).willReturn(Optional.of(user));
        given(training.canModify(user)).willReturn(false);

        assertThatThrownBy(() -> trainingCommandService.close(1L, "u@test.com"))
                .isInstanceOf(AccessDeniedException.class);
        verify(training, never()).close();
    }

    @Test
    @DisplayName("신청 마감 - 권한이 있으면 training.close 호출")
    void close_success() {
        Training training = mock(Training.class);
        User user = mock(User.class);
        given(trainingQueryService.findDetailById(1L)).willReturn(training);
        given(userRepository.findByEmail("admin@test.com")).willReturn(Optional.of(user));
        given(training.canModify(user)).willReturn(true);

        trainingCommandService.close(1L, "admin@test.com");

        verify(training).close();
    }
}
