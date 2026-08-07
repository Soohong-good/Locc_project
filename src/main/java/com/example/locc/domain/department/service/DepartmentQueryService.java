package com.example.locc.domain.department.service;

import com.example.locc.config.CacheConfig;
import com.example.locc.domain.department.dto.response.DepartmentBoardDetailResponse;
import com.example.locc.domain.department.dto.response.DepartmentBoardResponse;
import com.example.locc.domain.department.dto.response.DepartmentResponse;
import com.example.locc.domain.department.entity.Department;
import com.example.locc.domain.department.entity.DepartmentBoard;
import com.example.locc.domain.department.repository.DepartmentBoardRepository;
import com.example.locc.domain.department.repository.DepartmentRepository;
import com.example.locc.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DepartmentQueryService {

    private final DepartmentRepository departmentRepository;
    private final DepartmentBoardRepository boardRepository;

    public Long countAll() {
        return departmentRepository.count();
    }

    // 부서 전체 목록 조회 (교회 갤러리 전용 church 의사 부서는 제외)
    @Cacheable(value = CacheConfig.CACHE_DEPARTMENTS, key = "'all'")
    public List<DepartmentResponse> findAll() {
        return departmentRepository.findAllByCodeNot(Department.CHURCH_CODE)
                .stream()
                .map(DepartmentResponse::from)
                .collect(java.util.stream.Collectors.toList());
    }

    // 부서 정보 조회 (코드로)
    public DepartmentResponse getDepartmentByCode(String code) {
        Department department = departmentRepository.findByCode(code)
            .orElseThrow(() -> new NotFoundException("부서를 찾을 수 없습니다: " + code));
        return DepartmentResponse.from(department);
    }

    // 부서 게시판 목록 조회 (최대 5개)
    public Page<DepartmentBoardResponse> getBoardList(String departmentCode) {
        Department department = departmentRepository.findByCode(departmentCode)
            .orElseThrow(() -> new NotFoundException("부서를 찾을 수 없습니다: " + departmentCode));
        
        Pageable pageable = PageRequest.of(0, 5);
        Page<DepartmentBoard> boards = boardRepository.findByDepartmentOrderByIsPinnedDescCreatedAtDesc(department, pageable);
        
        return boards.map(DepartmentBoardResponse::from);
    }

    // 부서 게시판 상세 조회
    public DepartmentBoardDetailResponse getBoardDetail(Long boardId) {
        DepartmentBoard board = boardRepository.findDetailById(boardId)
            .orElseThrow(() -> new NotFoundException("게시글을 찾을 수 없습니다: " + boardId));
        return DepartmentBoardDetailResponse.from(board);
    }
}
