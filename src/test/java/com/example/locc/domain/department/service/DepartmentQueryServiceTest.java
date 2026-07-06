package com.example.locc.domain.department.service;

import com.example.locc.domain.department.dto.response.DepartmentBoardDetailResponse;
import com.example.locc.domain.department.dto.response.DepartmentBoardResponse;
import com.example.locc.domain.department.dto.response.DepartmentResponse;
import com.example.locc.domain.department.entity.Department;
import com.example.locc.domain.department.entity.DepartmentBoard;
import com.example.locc.domain.department.repository.DepartmentBoardRepository;
import com.example.locc.domain.department.repository.DepartmentRepository;
import com.example.locc.domain.user.entity.User;
import com.example.locc.exception.NotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;

/**
 * DepartmentQueryService 단위 테스트 (Mockito, DB 불필요)
 * - 부서·게시판 조회 로직과 존재 검증 규칙을 검증한다.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("DepartmentQueryService 단위 테스트")
class DepartmentQueryServiceTest {

    @Mock private DepartmentRepository departmentRepository;
    @Mock private DepartmentBoardRepository boardRepository;

    @InjectMocks private DepartmentQueryService departmentQueryService;

    @Test
    @DisplayName("전체 부서 개수 - repository.count()를 그대로 반환한다")
    void countAll() {
        given(departmentRepository.count()).willReturn(8L);

        assertThat(departmentQueryService.countAll()).isEqualTo(8L);
    }

    @Test
    @DisplayName("전체 부서 목록 - DepartmentResponse 리스트로 매핑된다")
    void findAll() {
        Department dept1 = Department.create("nursery", "태영아부", "Nursery Ministry");
        Department dept2 = Department.create("preschool", "유아유치부", "Preschool Ministry");
        given(departmentRepository.findAll()).willReturn(List.of(dept1, dept2));

        List<DepartmentResponse> result = departmentQueryService.findAll();

        assertThat(result).hasSize(2);
        assertThat(result).extracting(DepartmentResponse::getCode)
                .containsExactly("nursery", "preschool");
    }

    @Test
    @DisplayName("부서 코드 조회 - 존재하지 않으면 NotFoundException")
    void getDepartmentByCode_notFound() {
        given(departmentRepository.findByCode("unknown")).willReturn(Optional.empty());

        assertThatThrownBy(() -> departmentQueryService.getDepartmentByCode("unknown"))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("부서 코드 조회 - 존재하면 DepartmentResponse를 반환한다")
    void getDepartmentByCode_found() {
        Department department = Department.create("nursery", "태영아부", "Nursery Ministry");
        given(departmentRepository.findByCode("nursery")).willReturn(Optional.of(department));

        DepartmentResponse response = departmentQueryService.getDepartmentByCode("nursery");

        assertThat(response.getCode()).isEqualTo("nursery");
        assertThat(response.getName()).isEqualTo("태영아부");
    }

    @Test
    @DisplayName("부서 게시판 목록 - 부서가 없으면 NotFoundException")
    void getBoardList_departmentNotFound() {
        given(departmentRepository.findByCode("unknown")).willReturn(Optional.empty());

        assertThatThrownBy(() -> departmentQueryService.getBoardList("unknown"))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("부서 게시판 목록 - 정상 케이스면 최대 5건 페이지로 반환한다")
    void getBoardList_success() {
        Department department = Department.create("nursery", "태영아부", "Nursery Ministry");
        User author = mock(User.class);
        given(author.getId()).willReturn(UUID.randomUUID());
        DepartmentBoard board = DepartmentBoard.create(department, "제목", "내용", author);
        Page<DepartmentBoard> page = new PageImpl<>(List.of(board));
        given(departmentRepository.findByCode("nursery")).willReturn(Optional.of(department));
        given(boardRepository.findByDepartmentOrderByIsPinnedDescCreatedAtDesc(any(Department.class), any(Pageable.class)))
                .willReturn(page);

        Page<DepartmentBoardResponse> result = departmentQueryService.getBoardList("nursery");

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("제목");
    }

    @Test
    @DisplayName("부서 게시판 상세 - 게시글이 없으면 NotFoundException")
    void getBoardDetail_notFound() {
        given(boardRepository.findDetailById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> departmentQueryService.getBoardDetail(1L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("부서 게시판 상세 - 정상 케이스면 상세 응답을 반환한다")
    void getBoardDetail_success() {
        Department department = Department.create("nursery", "태영아부", "Nursery Ministry");
        User author = mock(User.class);
        given(author.getName()).willReturn("홍길동");
        given(author.getId()).willReturn(UUID.randomUUID());
        DepartmentBoard board = DepartmentBoard.create(department, "제목", "내용", author);
        given(boardRepository.findDetailById(1L)).willReturn(Optional.of(board));

        DepartmentBoardDetailResponse response = departmentQueryService.getBoardDetail(1L);

        assertThat(response.getTitle()).isEqualTo("제목");
        assertThat(response.getAuthorName()).isEqualTo("홍길동");
    }
}
