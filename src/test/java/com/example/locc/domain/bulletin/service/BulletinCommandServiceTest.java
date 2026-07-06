package com.example.locc.domain.bulletin.service;

import com.example.locc.domain.bulletin.dto.command.BulletinCreateCommand;
import com.example.locc.domain.bulletin.dto.command.BulletinUpdateCommand;
import com.example.locc.domain.bulletin.dto.response.BulletinDetailResponse;
import com.example.locc.domain.bulletin.entity.Bulletin;
import com.example.locc.domain.bulletin.repository.BulletinRepository;
import com.example.locc.domain.file.service.FileCommandService;
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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

/**
 * BulletinCommandService 단위 테스트 (Mockito, DB 불필요)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("BulletinCommandService 단위 테스트")
class BulletinCommandServiceTest {

    @Mock private BulletinRepository bulletinRepository;
    @Mock private UserRepository userRepository;
    @Mock private FileCommandService fileCommandService;
    @Mock private UserPermissionService userPermissionService;

    @InjectMocks private BulletinCommandService bulletinCommandService;

    private BulletinCreateCommand createCommand() {
        return BulletinCreateCommand.builder()
                .title("제목")
                .content("내용")
                .thumbnailUrl(null)
                .build();
    }

    @Test
    @DisplayName("주보 생성 - 작성 권한이 없으면 IllegalStateException")
    void createBulletin_noPermission() {
        assertThatThrownBy(() -> bulletinCommandService.createBulletin(createCommand(), null, "user@test.com"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("권한");
    }

    @Test
    @DisplayName("주보 생성 - 권한은 있으나 작성자를 찾을 수 없으면 UsernameNotFoundException")
    void createBulletin_userNotFound() {
        given(userPermissionService.hasPermission("author@test.com", AreaType.BULLETIN)).willReturn(true);
        given(userRepository.findByEmail("author@test.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> bulletinCommandService.createBulletin(createCommand(), null, "author@test.com"))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    @DisplayName("주보 생성 - 정상 케이스면 저장 후 상세 응답을 반환한다")
    void createBulletin_success() {
        User author = mock(User.class);
        given(author.getId()).willReturn(java.util.UUID.randomUUID());
        given(userPermissionService.hasPermission("author@test.com", AreaType.BULLETIN)).willReturn(true);
        given(userRepository.findByEmail("author@test.com")).willReturn(Optional.of(author));
        given(bulletinRepository.save(org.mockito.ArgumentMatchers.any(Bulletin.class)))
                .willAnswer(invocation -> invocation.getArgument(0));

        BulletinDetailResponse response = bulletinCommandService.createBulletin(createCommand(), null, "author@test.com");

        assertThat(response.getTitle()).isEqualTo("제목");
    }

    @Test
    @DisplayName("주보 수정 - 수정 권한이 없으면 AccessDeniedException")
    void updateBulletin_noPermission() {
        User author = mock(User.class);
        User other = mock(User.class);
        Bulletin bulletin = Bulletin.create(createCommand(), author);
        given(userRepository.findByEmail("other@test.com")).willReturn(Optional.of(other));
        given(bulletinRepository.findDetailById(1L)).willReturn(Optional.of(bulletin));
        given(other.isAdmin()).willReturn(false);

        assertThatThrownBy(() -> bulletinCommandService.updateBulletin(1L, BulletinUpdateCommand.builder().build(), null, "other@test.com"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("주보 수정 - 작성자 본인이면 제목/내용이 반영된다")
    void updateBulletin_success() {
        User author = mock(User.class);
        given(author.getId()).willReturn(java.util.UUID.randomUUID());
        Bulletin bulletin = Bulletin.create(createCommand(), author);
        given(userRepository.findByEmail("author@test.com")).willReturn(Optional.of(author));
        given(bulletinRepository.findDetailById(1L)).willReturn(Optional.of(bulletin));

        BulletinUpdateCommand command = BulletinUpdateCommand.builder()
                .title("새 제목").content("새 내용").build();
        BulletinDetailResponse response = bulletinCommandService.updateBulletin(1L, command, null, "author@test.com");

        assertThat(response.getTitle()).isEqualTo("새 제목");
        assertThat(response.getContent()).isEqualTo("새 내용");
    }

    @Test
    @DisplayName("주보 삭제 - 삭제 권한이 없으면 AccessDeniedException")
    void deleteBulletin_noPermission() {
        User author = mock(User.class);
        User other = mock(User.class);
        Bulletin bulletin = Bulletin.create(createCommand(), author);
        given(userRepository.findByEmail("other@test.com")).willReturn(Optional.of(other));
        given(bulletinRepository.findById(1L)).willReturn(Optional.of(bulletin));
        given(other.isAdmin()).willReturn(false);

        assertThatThrownBy(() -> bulletinCommandService.deleteBulletin(1L, "other@test.com"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("주보 삭제 - 정상 케이스면 repository.delete가 호출된다")
    void deleteBulletin_success() {
        User author = mock(User.class);
        Bulletin bulletin = Bulletin.create(createCommand(), author);
        given(userRepository.findByEmail("author@test.com")).willReturn(Optional.of(author));
        given(bulletinRepository.findById(1L)).willReturn(Optional.of(bulletin));

        bulletinCommandService.deleteBulletin(1L, "author@test.com");

        verify(bulletinRepository).delete(bulletin);
    }

    @Test
    @DisplayName("조회수 증가 - 존재하지 않는 주보면 IllegalArgumentException")
    void increaseViewCount_notFound() {
        given(bulletinRepository.findById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> bulletinCommandService.increaseViewCount(1L))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("조회수 증가 - 정상 케이스면 조회수가 1 증가한다")
    void increaseViewCount_success() {
        User author = mock(User.class);
        Bulletin bulletin = Bulletin.create(createCommand(), author);
        given(bulletinRepository.findById(1L)).willReturn(Optional.of(bulletin));

        bulletinCommandService.increaseViewCount(1L);

        assertThat(bulletin.getViewCount()).isEqualTo(1);
    }
}
