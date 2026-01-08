package com.example.locc.domain.department.controller;

import com.example.locc.domain.department.dto.response.DepartmentBoardDetailResponse;
import com.example.locc.domain.department.dto.response.DepartmentBoardResponse;
import com.example.locc.domain.department.dto.response.DepartmentResponse;
import com.example.locc.domain.department.service.DepartmentCommandService;
import com.example.locc.domain.department.service.DepartmentQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Slf4j
@Controller
@RequiredArgsConstructor
@RequestMapping("/department")
public class DepartmentViewController {

    private final DepartmentQueryService queryService;
    private final DepartmentCommandService commandService;

    // 부서 메인 페이지 (통합)
    @GetMapping("/{departmentCode}")
    public String department(@PathVariable String departmentCode, Model model) {
        log.info("Accessing {} department page", departmentCode);
        
        try {
            DepartmentResponse department = queryService.getDepartmentByCode(departmentCode);
            Page<DepartmentBoardResponse> boards = queryService.getBoardList(departmentCode);
            
            model.addAttribute("department", department);
            model.addAttribute("boards", boards.getContent());
        } catch (Exception e) {
            log.warn("Department data not found: {}", e.getMessage());
        }
        
        return "department/department";
    }

    // 게시글 상세 보기
    @GetMapping("/{departmentCode}/board/{boardId}")
    public String boardDetail(@PathVariable String departmentCode,
                             @PathVariable Long boardId,
                             Model model) {
        log.info("Accessing board detail: department={}, boardId={}", departmentCode, boardId);
        
        try {
            // 조회수 증가
            commandService.incrementViewCount(boardId);
            
            // 게시글 상세 조회
            DepartmentBoardDetailResponse board = queryService.getBoardDetail(boardId);
            
            model.addAttribute("board", board);
            model.addAttribute("departmentCode", departmentCode);
        } catch (Exception e) {
            log.error("Error loading board detail", e);
            return "redirect:/department/" + departmentCode;
        }
        
        return "department/board-detail";
    }
}
