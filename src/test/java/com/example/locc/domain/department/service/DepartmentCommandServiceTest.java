package com.example.locc.domain.department.service;

import com.example.locc.domain.department.dto.command.DepartmentBoardCreateCommand;
import com.example.locc.domain.department.dto.command.DepartmentBoardUpdateCommand;
import com.example.locc.domain.department.dto.response.DepartmentBoardDetailResponse;
import com.example.locc.domain.department.entity.Department;
import com.example.locc.domain.department.entity.DepartmentBoard;
import com.example.locc.domain.department.repository.DepartmentBoardRepository;
import com.example.locc.domain.department.repository.DepartmentRepository;
import com.example.locc.domain.user.entity.AreaType;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.domain.user.service.UserPermissionService;
import com.example.locc.exception.AccessDeniedException;
import com.example.locc.exception.InvalidInputException;
import com.example.locc.exception.NotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

/**
 * DepartmentCommandService 단위 테스트 (Mockito, DB 불필요)
 * - 부서 게시판 CRUD의 권한/존재 검증 규칙을 검증한다.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("DepartmentCommandService 단위 테스트")
class DepartmentCommandServiceTest {

    @Mock private DepartmentBoardRepository boardRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private UserRepository userRepository;
    @Mock private UserPermissionService userPermissionService;

    @InjectMocks private DepartmentCommandService departmentCommandService;

    private Department department;
    private User author;

    private Department newDepartment() {
        return Department.create("nursery", "태영아부", "Nursery Ministry");
    }

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        department = newDepartment();
        author = mock(User.class);
    }

    @Test
    @DisplayName("게시글 생성 - 작성 권한이 없으면 AccessDeniedException")
    void create_noPermission() {
        DepartmentBoardCreateCommand command = mock(DepartmentBoardCreateCommand.class);
        given(userPermissionService.hasPermission("user@test.com", AreaType.DEPARTMENT)).willReturn(false);

        assertThatThrownBy(() -> departmentCommandService.create(command, "user@test.com"))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("권한");
    }

    @Test
    @DisplayName("게시글 생성 - 권한은 있으나 작성자를 찾을 수 없으면 NotFoundException")
    void create_authorNotFound() {
        DepartmentBoardCreateCommand command = mock(DepartmentBoardCreateCommand.class);
        given(userPermissionService.hasPermission("user@test.com", AreaType.DEPARTMENT)).willReturn(true);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> departmentCommandService.create(command, "user@test.com"))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("게시글 생성 - 부서를 찾을 수 없으면 NotFoundException")
    void create_departmentNotFound() {
        DepartmentBoardCreateCommand command = mock(DepartmentBoardCreateCommand.class);
        given(command.getDepartmentCode()).willReturn("unknown");
        given(userPermissionService.hasPermission("user@test.com", AreaType.DEPARTMENT)).willReturn(true);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(author));
        given(departmentRepository.findByCode("unknown")).willReturn(Optional.empty());

        assertThatThrownBy(() -> departmentCommandService.create(command, "user@test.com"))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("게시글 생성 - 정상 케이스면 저장 후 상세 응답 반환")
    void create_success() {
        DepartmentBoardCreateCommand command = mock(DepartmentBoardCreateCommand.class);
        given(command.getDepartmentCode()).willReturn("nursery");
        given(command.getTitle()).willReturn("제목");
        given(command.getContent()).willReturn("내용");
        given(userPermissionService.hasPermission("user@test.com", AreaType.DEPARTMENT)).willReturn(true);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(author));
        given(departmentRepository.findByCode("nursery")).willReturn(Optional.of(department));
        given(author.getName()).willReturn("홍길동");
        given(author.getId()).willReturn(UUID.randomUUID());
        given(boardRepository.save(org.mockito.ArgumentMatchers.any(DepartmentBoard.class)))
                .willAnswer(invocation -> invocation.getArgument(0));

        DepartmentBoardDetailResponse response = departmentCommandService.create(command, "user@test.com");

        assertThat(response.getTitle()).isEqualTo("제목");
        assertThat(response.getDepartmentCode()).isEqualTo("nursery");
    }

    @Test
    @DisplayName("게시글 수정 - 작성자를 찾을 수 없으면 NotFoundException")
    void update_userNotFound() {
        DepartmentBoardUpdateCommand command = mock(DepartmentBoardUpdateCommand.class);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> departmentCommandService.update(command, "nursery", "user@test.com"))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("게시글 수정 - 게시글이 없으면 NotFoundException")
    void update_boardNotFound() {
        DepartmentBoardUpdateCommand command = mock(DepartmentBoardUpdateCommand.class);
        given(command.getId()).willReturn(1L);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(author));
        given(boardRepository.findDetailById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> departmentCommandService.update(command, "nursery", "user@test.com"))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("게시글 수정 - 부서 코드가 일치하지 않으면 InvalidInputException")
    void update_departmentCodeMismatch() {
        DepartmentBoard board = DepartmentBoard.create(department, "제목", "내용", author);
        DepartmentBoardUpdateCommand command = mock(DepartmentBoardUpdateCommand.class);
        given(command.getId()).willReturn(1L);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(author));
        given(boardRepository.findDetailById(1L)).willReturn(Optional.of(board));

        assertThatThrownBy(() -> departmentCommandService.update(command, "other-dept", "user@test.com"))
                .isInstanceOf(InvalidInputException.class)
                .hasMessageContaining("부서");
    }

    @Test
    @DisplayName("게시글 수정 - 수정 권한이 없으면 AccessDeniedException")
    void update_noPermission() {
        DepartmentBoard board = DepartmentBoard.create(department, "제목", "내용", author);
        DepartmentBoardUpdateCommand command = mock(DepartmentBoardUpdateCommand.class);
        User otherUser = mock(User.class);
        given(command.getId()).willReturn(1L);
        given(userRepository.findByEmail("other@test.com")).willReturn(Optional.of(otherUser));
        given(boardRepository.findDetailById(1L)).willReturn(Optional.of(board));
        given(author.getId()).willReturn(UUID.randomUUID());
        given(otherUser.getId()).willReturn(UUID.randomUUID());
        given(otherUser.isAdminOrOperator()).willReturn(false);

        assertThatThrownBy(() -> departmentCommandService.update(command, "nursery", "other@test.com"))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("권한");
    }

    @Test
    @DisplayName("게시글 수정 - 정상 케이스면 제목·내용이 반영된다")
    void update_success() {
        DepartmentBoard board = DepartmentBoard.create(department, "옛 제목", "옛 내용", author);
        DepartmentBoardUpdateCommand command = mock(DepartmentBoardUpdateCommand.class);
        given(command.getId()).willReturn(1L);
        given(command.getTitle()).willReturn("새 제목");
        given(command.getContent()).willReturn("새 내용");
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(author));
        given(boardRepository.findDetailById(1L)).willReturn(Optional.of(board));
        given(author.getId()).willReturn(UUID.randomUUID());
        given(author.getName()).willReturn("홍길동");

        DepartmentBoardDetailResponse response = departmentCommandService.update(command, "nursery", "user@test.com");

        assertThat(response.getTitle()).isEqualTo("새 제목");
        assertThat(response.getContent()).isEqualTo("새 내용");
    }

    @Test
    @DisplayName("게시글 삭제 - 삭제 권한이 없으면 AccessDeniedException")
    void delete_noPermission() {
        DepartmentBoard board = DepartmentBoard.create(department, "제목", "내용", author);
        User otherUser = mock(User.class);
        given(userRepository.findByEmail("other@test.com")).willReturn(Optional.of(otherUser));
        given(boardRepository.findDetailById(1L)).willReturn(Optional.of(board));
        given(author.getId()).willReturn(UUID.randomUUID());
        given(otherUser.getId()).willReturn(UUID.randomUUID());
        given(otherUser.isAdminOrOperator()).willReturn(false);

        assertThatThrownBy(() -> departmentCommandService.delete(1L, "nursery", "other@test.com"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("게시글 삭제 - 정상 케이스면 repository.delete가 호출된다")
    void delete_success() {
        DepartmentBoard board = DepartmentBoard.create(department, "제목", "내용", author);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(author));
        given(boardRepository.findDetailById(1L)).willReturn(Optional.of(board));
        given(author.getId()).willReturn(UUID.randomUUID());

        departmentCommandService.delete(1L, "nursery", "user@test.com");

        verify(boardRepository).delete(board);
    }

    @Test
    @DisplayName("조회수 증가 - 게시글이 없으면 NotFoundException")
    void incrementViewCount_notFound() {
        given(boardRepository.findById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> departmentCommandService.incrementViewCount(1L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("조회수 증가 - 정상 케이스면 조회수가 1 증가한다")
    void incrementViewCount_success() {
        DepartmentBoard board = DepartmentBoard.create(department, "제목", "내용", author);
        given(boardRepository.findById(1L)).willReturn(Optional.of(board));

        departmentCommandService.incrementViewCount(1L);

        assertThat(board.getViewCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("고정 토글 - 관리자가 아니면 AccessDeniedException")
    void togglePin_notAdmin() {
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(author));
        given(author.isAdmin()).willReturn(false);

        assertThatThrownBy(() -> departmentCommandService.togglePin(1L, "nursery", "user@test.com"))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("관리자");
    }

    @Test
    @DisplayName("고정 토글 - 부서 코드가 일치하지 않으면 InvalidInputException")
    void togglePin_departmentCodeMismatch() {
        DepartmentBoard board = DepartmentBoard.create(department, "제목", "내용", author);
        given(userRepository.findByEmail("admin@test.com")).willReturn(Optional.of(author));
        given(author.isAdmin()).willReturn(true);
        given(boardRepository.findById(1L)).willReturn(Optional.of(board));

        assertThatThrownBy(() -> departmentCommandService.togglePin(1L, "other-dept", "admin@test.com"))
                .isInstanceOf(InvalidInputException.class);
    }

    @Test
    @DisplayName("고정 토글 - 정상 케이스면 isPinned가 반전된다")
    void togglePin_success() {
        DepartmentBoard board = DepartmentBoard.create(department, "제목", "내용", author);
        given(userRepository.findByEmail("admin@test.com")).willReturn(Optional.of(author));
        given(author.isAdmin()).willReturn(true);
        given(boardRepository.findById(1L)).willReturn(Optional.of(board));

        departmentCommandService.togglePin(1L, "nursery", "admin@test.com");

        assertThat(board.getIsPinned()).isTrue();
    }
}
