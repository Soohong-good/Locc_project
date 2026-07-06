package com.example.locc.domain.praisesheet.service;

import com.example.locc.domain.praisesheet.dto.command.PraiseSheetCreateCommand;
import com.example.locc.domain.praisesheet.dto.command.PraiseSheetUpdateCommand;
import com.example.locc.domain.praisesheet.dto.response.PraiseSheetDetailResponse;
import com.example.locc.domain.praisesheet.entity.PraiseSheet;
import com.example.locc.domain.praisesheet.repository.PraiseSheetRepository;
import com.example.locc.domain.file.service.FileCommandService;
import com.example.locc.domain.file.service.FileQueryService;
import com.example.locc.domain.user.entity.AreaType;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.domain.user.service.UserPermissionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

/**
 * PraiseSheetCommandService 단위 테스트 (Mockito, DB 불필요)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("PraiseSheetCommandService 단위 테스트")
class PraiseSheetCommandServiceTest {

    @Mock private PraiseSheetRepository praiseSheetRepository;
    @Mock private PraiseSheetQueryService praiseSheetQueryService;
    @Mock private UserRepository userRepository;
    @Mock private FileCommandService fileCommandService;
    @Mock private FileQueryService fileQueryService;
    @Mock private UserPermissionService userPermissionService;

    @InjectMocks private PraiseSheetCommandService praiseSheetCommandService;

    private PraiseSheetCreateCommand createCommand(String email) {
        return PraiseSheetCreateCommand.builder()
                .title("제목").content("내용").createdByEmail(email).build();
    }

    @Test
    @DisplayName("찬양악보 생성 - 작성 권한이 없으면 IllegalStateException")
    void create_noPermission() {
        PraiseSheetCreateCommand command = createCommand("user@test.com");

        assertThatThrownBy(() -> praiseSheetCommandService.create(command))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("권한");
    }

    @Test
    @DisplayName("찬양악보 생성 - 권한은 있으나 작성자를 찾을 수 없으면 UsernameNotFoundException")
    void create_userNotFound() {
        given(userPermissionService.hasPermission("author@test.com", AreaType.PRAISE_SHEET)).willReturn(true);
        given(userRepository.findByEmail("author@test.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> praiseSheetCommandService.create(createCommand("author@test.com")))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    @DisplayName("찬양악보 생성 - 정상 케이스면 저장 후 상세 응답을 반환한다 (첨부파일 없음)")
    void create_success() {
        User author = mock(User.class);
        given(author.getId()).willReturn(java.util.UUID.randomUUID());
        given(userPermissionService.hasPermission("author@test.com", AreaType.PRAISE_SHEET)).willReturn(true);
        given(userRepository.findByEmail("author@test.com")).willReturn(Optional.of(author));
        given(praiseSheetRepository.save(org.mockito.ArgumentMatchers.any(PraiseSheet.class)))
                .willAnswer(invocation -> invocation.getArgument(0));

        PraiseSheetDetailResponse response = praiseSheetCommandService.create(createCommand("author@test.com"));

        assertThat(response.getTitle()).isEqualTo("제목");
        assertThat(response.getAttachments()).isEmpty();
    }

    @Test
    @DisplayName("찬양악보 수정 - 수정 권한이 없으면 IllegalStateException")
    void update_noPermission() {
        User author = mock(User.class);
        User other = mock(User.class);
        PraiseSheet ps = PraiseSheet.create(createCommand("author@test.com"), author);
        given(praiseSheetQueryService.findById(1L)).willReturn(ps);
        given(userRepository.findByEmail("other@test.com")).willReturn(Optional.of(other));
        given(other.isAdmin()).willReturn(false);

        PraiseSheetUpdateCommand command = PraiseSheetUpdateCommand.builder()
                .praiseSheetId(1L).title("새 제목").updatedByEmail("other@test.com").build();

        assertThatThrownBy(() -> praiseSheetCommandService.update(command))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("찬양악보 수정 - 작성자 본인이면 제목이 반영된다 (첨부파일 없으면 기존 목록 유지)")
    void update_success() {
        User author = mock(User.class);
        given(author.getId()).willReturn(java.util.UUID.randomUUID());
        PraiseSheet ps = PraiseSheet.create(createCommand("author@test.com"), author);
        given(praiseSheetQueryService.findById(1L)).willReturn(ps);
        given(userRepository.findByEmail("author@test.com")).willReturn(Optional.of(author));
        given(fileQueryService.getPraiseSheetAttachments(null)).willReturn(List.of());

        PraiseSheetUpdateCommand command = PraiseSheetUpdateCommand.builder()
                .praiseSheetId(1L).title("새 제목").content("새 내용").updatedByEmail("author@test.com").build();

        PraiseSheetDetailResponse response = praiseSheetCommandService.update(command);

        assertThat(response.getTitle()).isEqualTo("새 제목");
    }

    @Test
    @DisplayName("찬양악보 삭제 - 삭제 권한이 없으면 IllegalStateException")
    void delete_noPermission() {
        User author = mock(User.class);
        User other = mock(User.class);
        PraiseSheet ps = PraiseSheet.create(createCommand("author@test.com"), author);
        given(praiseSheetQueryService.findById(1L)).willReturn(ps);
        given(userRepository.findByEmail("other@test.com")).willReturn(Optional.of(other));
        given(other.isAdmin()).willReturn(false);

        assertThatThrownBy(() -> praiseSheetCommandService.delete(1L, "other@test.com"))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("찬양악보 삭제 - 정상 케이스면 첨부파일 삭제 후 repository.delete가 호출된다")
    void delete_success() {
        User author = mock(User.class);
        PraiseSheet ps = PraiseSheet.create(createCommand("author@test.com"), author);
        given(praiseSheetQueryService.findById(1L)).willReturn(ps);
        given(userRepository.findByEmail("author@test.com")).willReturn(Optional.of(author));

        praiseSheetCommandService.delete(1L, "author@test.com");

        verify(fileCommandService).deletePraiseSheetFiles(1L);
        verify(praiseSheetRepository).delete(ps);
    }

    @Test
    @DisplayName("조회수 증가 - 대상 엔티티의 조회수를 1 증가시킨다")
    void increaseViews() {
        User author = mock(User.class);
        PraiseSheet ps = PraiseSheet.create(createCommand("author@test.com"), author);
        given(praiseSheetQueryService.findById(1L)).willReturn(ps);

        praiseSheetCommandService.increaseViews(1L);

        assertThat(ps.getViewCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("고정 토글 - 관리자가 아니면 IllegalStateException")
    void togglePin_notAdmin() {
        User user = mock(User.class);
        PraiseSheet ps = mock(PraiseSheet.class);
        given(praiseSheetQueryService.findById(1L)).willReturn(ps);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(user));
        given(user.isAdmin()).willReturn(false);

        assertThatThrownBy(() -> praiseSheetCommandService.togglePin(1L, "user@test.com"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("관리자");
    }

    @Test
    @DisplayName("고정 토글 - 관리자면 isPinned가 반전된다")
    void togglePin_success() {
        User admin = mock(User.class);
        PraiseSheet ps = mock(PraiseSheet.class);
        given(praiseSheetQueryService.findById(1L)).willReturn(ps);
        given(userRepository.findByEmail("admin@test.com")).willReturn(Optional.of(admin));
        given(admin.isAdmin()).willReturn(true);

        praiseSheetCommandService.togglePin(1L, "admin@test.com");

        verify(ps).togglePin();
    }

    @Test
    @DisplayName("본문 이미지 업로드 - 작성 권한이 없으면 IllegalStateException")
    void uploadContentImage_noPermission() {
        MultipartFile image = mock(MultipartFile.class);

        assertThatThrownBy(() -> praiseSheetCommandService.uploadContentImage(image, "user@test.com"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("권한");
    }
}
