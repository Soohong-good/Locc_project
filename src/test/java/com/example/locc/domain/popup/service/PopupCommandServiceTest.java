package com.example.locc.domain.popup.service;

import com.example.locc.domain.file.service.FileCommandService;
import com.example.locc.domain.popup.dto.command.PopupCreateCommand;
import com.example.locc.domain.popup.dto.command.PopupUpdateCommand;
import com.example.locc.domain.popup.dto.response.PopupDetailResponse;
import com.example.locc.domain.popup.entity.Popup;
import com.example.locc.domain.popup.repository.PopupRepository;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

/**
 * PopupCommandService 단위 테스트 (Mockito, DB 불필요)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("PopupCommandService 단위 테스트")
class PopupCommandServiceTest {

    @Mock private FileCommandService fileCommandService;
    @Mock private PopupRepository popupRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private PopupCommandService popupCommandService;

    private PopupCreateCommand createCommand() {
        PopupCreateCommand command = mock(PopupCreateCommand.class);
        given(command.getTitle()).willReturn("제목");
        given(command.getContent()).willReturn("내용");
        given(command.getDisplayStartDate()).willReturn(LocalDateTime.now());
        given(command.getDisplayEndDate()).willReturn(LocalDateTime.now().plusDays(7));
        return command;
    }

    @Test
    @DisplayName("팝업 생성 - 사용자를 찾을 수 없으면 IllegalArgumentException")
    void createPopup_userNotFound() {
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> popupCommandService.createPopup(mock(PopupCreateCommand.class), "user@test.com"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("팝업 생성 - 관리자가 아니면 AccessDeniedException")
    void createPopup_notAdmin() {
        User user = mock(User.class);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(user));
        given(user.isAdmin()).willReturn(false);

        assertThatThrownBy(() -> popupCommandService.createPopup(mock(PopupCreateCommand.class), "user@test.com"))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("관리자");
    }

    @Test
    @DisplayName("팝업 생성 - 정상 케이스면 저장 후 상세 응답을 반환한다")
    void createPopup_success() {
        User admin = mock(User.class);
        given(userRepository.findByEmail("admin@test.com")).willReturn(Optional.of(admin));
        given(admin.isAdmin()).willReturn(true);
        given(admin.getName()).willReturn("관리자");
        given(popupRepository.save(org.mockito.ArgumentMatchers.any(Popup.class)))
                .willAnswer(invocation -> invocation.getArgument(0));

        PopupDetailResponse response = popupCommandService.createPopup(createCommand(), "admin@test.com");

        assertThat(response.getTitle()).isEqualTo("제목");
        assertThat(response.getIsActive()).isTrue();
    }

    @Test
    @DisplayName("팝업 수정 - 팝업이 없으면 IllegalArgumentException")
    void updatePopup_notFound() {
        User user = mock(User.class);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(user));
        given(popupRepository.findById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> popupCommandService.updatePopup(1L, mock(PopupUpdateCommand.class), "user@test.com"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("팝업 수정 - 수정 권한이 없으면 AccessDeniedException")
    void updatePopup_noPermission() {
        User creator = mock(User.class);
        User other = mock(User.class);
        given(creator.getId()).willReturn(UUID.randomUUID());
        given(other.getId()).willReturn(UUID.randomUUID());
        given(other.isAdmin()).willReturn(false);
        Popup popup = Popup.create(createCommand(), creator);
        given(userRepository.findByEmail("other@test.com")).willReturn(Optional.of(other));
        given(popupRepository.findById(1L)).willReturn(Optional.of(popup));

        assertThatThrownBy(() -> popupCommandService.updatePopup(1L, mock(PopupUpdateCommand.class), "other@test.com"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("팝업 삭제 - 정상 케이스면 repository.delete가 호출된다")
    void deletePopup_success() {
        User admin = mock(User.class);
        given(admin.isAdmin()).willReturn(true);
        Popup popup = Popup.create(createCommand(), admin);
        given(userRepository.findByEmail("admin@test.com")).willReturn(Optional.of(admin));
        given(popupRepository.findById(1L)).willReturn(Optional.of(popup));

        popupCommandService.deletePopup(1L, "admin@test.com");

        verify(popupRepository).delete(popup);
    }

    @Test
    @DisplayName("활성화 토글 - 정상 케이스면 isActive가 반전된다")
    void toggleActive_success() {
        User admin = mock(User.class);
        given(admin.isAdmin()).willReturn(true);
        Popup popup = Popup.create(createCommand(), admin);
        given(userRepository.findByEmail("admin@test.com")).willReturn(Optional.of(admin));
        given(popupRepository.findById(1L)).willReturn(Optional.of(popup));

        PopupDetailResponse response = popupCommandService.toggleActive(1L, "admin@test.com");

        assertThat(response.getIsActive()).isFalse(); // 기본 true → 토글 후 false
    }
}
