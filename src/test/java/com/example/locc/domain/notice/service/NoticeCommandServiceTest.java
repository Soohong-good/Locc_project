package com.example.locc.domain.notice.service;

import com.example.locc.domain.file.service.FileCommandService;
import com.example.locc.domain.file.service.FileQueryService;
import com.example.locc.domain.notice.dto.command.NoticeCreateCommand;
import com.example.locc.domain.notice.repository.NoticeRepository;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.domain.user.service.UserPermissionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;

/**
 * NoticeCommandService 단위 테스트 (Mockito, DB 불필요)
 * - 권한 검증 경로를 검증한다.
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
    @DisplayName("본문 이미지 업로드 - 작성 권한이 없으면 IllegalStateException")
    void uploadContentImage_noPermission() {
        MultipartFile image = mock(MultipartFile.class);

        assertThatThrownBy(() -> noticeCommandService.uploadContentImage(image, "user@test.com"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("권한");
    }
}
