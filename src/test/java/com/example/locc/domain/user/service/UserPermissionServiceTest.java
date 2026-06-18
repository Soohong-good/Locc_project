package com.example.locc.domain.user.service;

import com.example.locc.domain.user.entity.AreaType;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.entity.UserAreaPermission;
import com.example.locc.domain.user.repository.UserAreaPermissionRepository;
import com.example.locc.domain.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

/**
 * UserPermissionService 단위 테스트 (Mockito, DB 불필요)
 * - 변경 빈도가 가장 높은 user 도메인의 핵심 권한 로직을 검증한다.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserPermissionService 단위 테스트")
class UserPermissionServiceTest {

    @Mock private UserAreaPermissionRepository permissionRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private UserPermissionService userPermissionService;

    // ───────────── 권한 목록 조회 ─────────────

    @Test
    @DisplayName("권한 목록 조회 - AreaType을 이름 문자열로 변환해 반환한다")
    void getUserPermissions_mapsAreaNames() {
        UUID userId = UUID.randomUUID();
        given(permissionRepository.findAreasByUserId(userId))
                .willReturn(List.of(AreaType.NOTICE, AreaType.BULLETIN));

        assertThat(userPermissionService.getUserPermissions(userId))
                .containsExactly("NOTICE", "BULLETIN");
    }

    @Test
    @DisplayName("본인 권한 조회 - 사용자가 없으면 IllegalArgumentException")
    void getMyPermissions_userNotFound() {
        given(userRepository.findByEmail("ghost@test.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> userPermissionService.getMyPermissions("ghost@test.com"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("본인 권한 조회 - 정상 조회 시 권한 이름 목록을 반환한다")
    void getMyPermissions_returnsAreaNames() {
        UUID userId = UUID.randomUUID();
        User user = mock(User.class);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(user));
        given(user.getId()).willReturn(userId);
        given(permissionRepository.findAreasByUserId(userId)).willReturn(List.of(AreaType.NOTICE));

        assertThat(userPermissionService.getMyPermissions("user@test.com"))
                .containsExactly("NOTICE");
    }

    // ───────────── 권한 부여 ─────────────

    @Test
    @DisplayName("권한 부여 - 대상 사용자가 없으면 IllegalArgumentException")
    void grantPermission_userNotFound() {
        UUID userId = UUID.randomUUID();
        given(userRepository.findById(userId)).willReturn(Optional.empty());

        assertThatThrownBy(() -> userPermissionService.grantPermission(userId, AreaType.NOTICE, "admin@test.com"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("권한 부여 - 이미 권한이 있으면 저장하지 않고 종료한다")
    void grantPermission_alreadyExists_skipsSave() {
        UUID userId = UUID.randomUUID();
        User user = mock(User.class);
        given(userRepository.findById(userId)).willReturn(Optional.of(user));
        given(permissionRepository.existsByUserAndArea(user, AreaType.NOTICE)).willReturn(true);

        userPermissionService.grantPermission(userId, AreaType.NOTICE, "admin@test.com");

        verify(permissionRepository, never()).save(any());
    }

    @Test
    @DisplayName("권한 부여 - 관리자를 찾을 수 없으면 IllegalArgumentException")
    void grantPermission_adminNotFound() {
        UUID userId = UUID.randomUUID();
        User user = mock(User.class);
        given(userRepository.findById(userId)).willReturn(Optional.of(user));
        given(permissionRepository.existsByUserAndArea(user, AreaType.NOTICE)).willReturn(false);
        given(userRepository.findByEmail("admin@test.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> userPermissionService.grantPermission(userId, AreaType.NOTICE, "admin@test.com"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("권한 부여 - 정상 경로면 권한을 저장한다")
    void grantPermission_saves() {
        UUID userId = UUID.randomUUID();
        User user = mock(User.class);
        User admin = mock(User.class);
        given(userRepository.findById(userId)).willReturn(Optional.of(user));
        given(permissionRepository.existsByUserAndArea(user, AreaType.NOTICE)).willReturn(false);
        given(userRepository.findByEmail("admin@test.com")).willReturn(Optional.of(admin));
        given(admin.getId()).willReturn(UUID.randomUUID());

        userPermissionService.grantPermission(userId, AreaType.NOTICE, "admin@test.com");

        verify(permissionRepository).save(any(UserAreaPermission.class));
    }

    // ───────────── 권한 회수 ─────────────

    @Test
    @DisplayName("권한 회수 - 대상 사용자가 없으면 IllegalArgumentException")
    void revokePermission_userNotFound() {
        UUID userId = UUID.randomUUID();
        given(userRepository.findById(userId)).willReturn(Optional.empty());

        assertThatThrownBy(() -> userPermissionService.revokePermission(userId, AreaType.NOTICE))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("권한 회수 - 정상 경로면 deleteByUserAndArea를 호출한다")
    void revokePermission_deletes() {
        UUID userId = UUID.randomUUID();
        User user = mock(User.class);
        given(userRepository.findById(userId)).willReturn(Optional.of(user));

        userPermissionService.revokePermission(userId, AreaType.NOTICE);

        verify(permissionRepository).deleteByUserAndArea(user, AreaType.NOTICE);
    }

    // ───────────── 권한 보유 여부 ─────────────

    @Test
    @DisplayName("권한 보유 - 이메일 사용자가 없으면 false")
    void hasPermission_emailNotFound_returnsFalse() {
        given(userRepository.findByEmail("ghost@test.com")).willReturn(Optional.empty());

        assertThat(userPermissionService.hasPermission("ghost@test.com", AreaType.NOTICE)).isFalse();
    }

    @Test
    @DisplayName("권한 보유 - 관리자/운영자는 영역 권한 없이도 항상 true")
    void hasPermission_adminOrOperator_returnsTrue() {
        User user = mock(User.class);
        given(userRepository.findByEmail("admin@test.com")).willReturn(Optional.of(user));
        given(user.isAdminOrOperator()).willReturn(true);

        assertThat(userPermissionService.hasPermission("admin@test.com", AreaType.NOTICE)).isTrue();
    }

    @Test
    @DisplayName("권한 보유 - 일반 사용자라도 해당 영역 권한이 있으면 true")
    void hasPermission_hasAreaPermission_returnsTrue() {
        User user = mock(User.class);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(user));
        given(user.isAdminOrOperator()).willReturn(false);
        given(permissionRepository.existsByUserAndArea(user, AreaType.NOTICE)).willReturn(true);

        assertThat(userPermissionService.hasPermission("user@test.com", AreaType.NOTICE)).isTrue();
    }

    @Test
    @DisplayName("권한 보유 - 관리자도 아니고 영역 권한도 없으면 false")
    void hasPermission_noPermission_returnsFalse() {
        User user = mock(User.class);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(user));
        given(user.isAdminOrOperator()).willReturn(false);
        given(permissionRepository.existsByUserAndArea(user, AreaType.NOTICE)).willReturn(false);

        assertThat(userPermissionService.hasPermission("user@test.com", AreaType.NOTICE)).isFalse();
    }
}
