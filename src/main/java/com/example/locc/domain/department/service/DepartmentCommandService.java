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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class DepartmentCommandService {

    private final DepartmentBoardRepository boardRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final UserPermissionService userPermissionService;

    // 게시글 생성
    public DepartmentBoardDetailResponse create(DepartmentBoardCreateCommand command, String email) {
        // 작성 권한 검증 (관리자/운영자 또는 DEPARTMENT 권한 보유자)
        if (!userPermissionService.hasPermission(email, AreaType.DEPARTMENT)) {
            throw new AccessDeniedException("부서 게시판 작성 권한이 없습니다");
        }

        User author = userRepository.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다"));

        Department department = departmentRepository.findByCode(command.getDepartmentCode())
            .orElseThrow(() -> new NotFoundException("부서를 찾을 수 없습니다: " + command.getDepartmentCode()));

        DepartmentBoard board = DepartmentBoard.create(
            department,
            command.getTitle(),
            command.getContent(),
            author
        );

        DepartmentBoard saved = boardRepository.save(board);
        return DepartmentBoardDetailResponse.from(saved);
    }

    // 게시글 수정
    public DepartmentBoardDetailResponse update(DepartmentBoardUpdateCommand command, String departmentCode, String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다"));

        DepartmentBoard board = boardRepository.findDetailById(command.getId())
            .orElseThrow(() -> new NotFoundException("게시글을 찾을 수 없습니다"));

        // 부서 코드 검증
        if (!board.getDepartment().getCode().equals(departmentCode)) {
            throw new InvalidInputException("부서 정보가 일치하지 않습니다");
        }

        // 권한 검증
        if (!board.canModify(user)) {
            throw new AccessDeniedException("수정 권한이 없습니다");
        }

        board.update(command.getTitle(), command.getContent());
        return DepartmentBoardDetailResponse.from(board);
    }

    // 게시글 삭제
    public void delete(Long boardId, String departmentCode, String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다"));

        DepartmentBoard board = boardRepository.findDetailById(boardId)
            .orElseThrow(() -> new NotFoundException("게시글을 찾을 수 없습니다"));

        // 부서 코드 검증
        if (!board.getDepartment().getCode().equals(departmentCode)) {
            throw new InvalidInputException("부서 정보가 일치하지 않습니다");
        }

        // 권한 검증
        if (!board.canModify(user)) {
            throw new AccessDeniedException("삭제 권한이 없습니다");
        }

        boardRepository.delete(board);
    }

    // 조회수 증가
    public void incrementViewCount(Long boardId) {
        DepartmentBoard board = boardRepository.findById(boardId)
            .orElseThrow(() -> new NotFoundException("게시글을 찾을 수 없습니다"));
        board.incrementViewCount();
    }

    // 고정/해제
    public void togglePin(Long boardId, String departmentCode, String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다"));

        // 관리자 권한 검증
        if (!user.isAdmin()) {
            throw new AccessDeniedException("관리자만 고정할 수 있습니다");
        }

        DepartmentBoard board = boardRepository.findById(boardId)
            .orElseThrow(() -> new NotFoundException("게시글을 찾을 수 없습니다"));

        // 부서 코드 검증
        if (!board.getDepartment().getCode().equals(departmentCode)) {
            throw new InvalidInputException("부서 정보가 일치하지 않습니다");
        }

        board.togglePin();
    }
}
