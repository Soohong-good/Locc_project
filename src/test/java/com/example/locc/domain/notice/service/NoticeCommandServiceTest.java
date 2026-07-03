package com.example.locc.domain.notice.service;

import com.example.locc.domain.file.service.FileCommandService;
import com.example.locc.domain.file.service.FileQueryService;
import com.example.locc.domain.notice.dto.command.NoticeCreateCommand;
import com.example.locc.domain.notice.entity.Notice;
import com.example.locc.domain.notice.repository.NoticeRepository;
import com.example.locc.domain.user.entity.AreaType;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.domain.user.service.UserPermissionService;
import com.example.locc.exception.NotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;

/**
 * NoticeCommandService 단위 테스트 (Mockito, DB 불필요)
 * - 권한/존재 검증 등 핵심 비즈니스 규칙을 검증한다.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("NoticeCommandService 단위 테스트")
class NoticeCommandServiceTest {

    @Mock private NoticeRepository noticeRepository;
    @Mock private NoticeQueryService noticeQueryService;
    @Mock private UserRepository userRepository;
    @Mock private FileCommandService fileCommandService;
    @Mock private FileQueryService fileQueryService;
    @Mock private UserPermissionService userPermissionService;

    @InjectMocks private NoticeCommandService noticeCommandService;

    @Test
    @DisplayName("공지 생성 - 작성 권한이 없으면 IllegalStateException")
    void create_noPermission() {
        // userPermissionService.hasPermission(...)는 stub하지 않으면 기본값 false → 권한 없음
        NoticeCreateCommand command = mock(NoticeCreateCommand.class);

        assertThatThrownBy(() -> noticeCommandService.create(command))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("권한");
    }

    @Test
    @DisplayName("공지 생성 - 권한은 있으나 작성자를 찾을 수 없으면 UsernameNotFoundException")
    void create_userNotFound() {
        NoticeCreateCommand command = mock(NoticeCreateCommand.class);
        given(command.getCreatedByEmail()).willReturn("author@test.com");
        given(userPermissionService.hasPermission("author@test.com", AreaType.NOTICE)).willReturn(true);
        given(userRepository.findByEmail("author@test.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> noticeCommandService.create(command))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    @DisplayName("본문 이미지 업로드 - 작성 권한이 없으면 IllegalStateException")
    void uploadContentImage_noPermission() {
        MultipartFile image = mock(MultipartFile.class);

        assertThatThrownBy(() -> noticeCommandService.uploadContentImage(image, "user@test.com"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("권한");
    }

    @Test
    @DisplayName("고정 토글 - 존재하지 않는 공지면 NotFoundException")
    void togglePin_notFound() {
        given(noticeRepository.findById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> noticeCommandService.togglePin(1L, "admin@test.com"))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("고정 토글 - 관리자가 아니면 IllegalStateException")
    void togglePin_notAdmin() {
        Notice notice = mock(Notice.class);
        User user = mock(User.class);
        given(noticeRepository.findById(1L)).willReturn(Optional.of(notice));
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(user));
        given(user.isAdmin()).willReturn(false);

        assertThatThrownBy(() -> noticeCommandService.togglePin(1L, "user@test.com"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("관리자");
    }

    @Test
    @DisplayName("공지 삭제 - 수정 권한이 없으면 IllegalStateException")
    void delete_noPermission() {
        Notice notice = mock(Notice.class);
        User user = mock(User.class);
        given(noticeQueryService.findById(1L)).willReturn(notice);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(user));
        given(notice.canModify(user)).willReturn(false);

        assertThatThrownBy(() -> noticeCommandService.delete(1L, "user@test.com"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("권한");
    }
}
