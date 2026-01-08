package com.example.locc.domain.department.controller;

import com.example.locc.domain.department.dto.request.DepartmentBoardRequest;
import com.example.locc.domain.department.dto.response.DepartmentBoardDetailResponse;
import com.example.locc.domain.department.service.DepartmentCommandService;
import com.example.locc.domain.department.service.DepartmentYouTubeUpdateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/department")
public class DepartmentApiController {

    private final DepartmentCommandService commandService;
    private final DepartmentYouTubeUpdateService youTubeUpdateService;

    // 게시글 생성
    @PostMapping("/{departmentCode}/board")
    public ResponseEntity<DepartmentBoardDetailResponse> createBoard(
            @PathVariable String departmentCode,
            @Valid @RequestBody DepartmentBoardRequest request,
            Authentication authentication) {
        
        log.info("Creating board for department: {}", departmentCode);
        
        DepartmentBoardDetailResponse response = commandService.create(
            request.toCreateCommand(departmentCode),
            authentication.getName()
        );
        
        return ResponseEntity.ok(response);
    }

    // 게시글 수정
    @PutMapping("/{departmentCode}/board/{boardId}")
    public ResponseEntity<DepartmentBoardDetailResponse> updateBoard(
            @PathVariable String departmentCode,
            @PathVariable Long boardId,
            @Valid @RequestBody DepartmentBoardRequest request,
            Authentication authentication) {
        
        log.info("Updating board: {} in department: {}", boardId, departmentCode);
        
        DepartmentBoardDetailResponse response = commandService.update(
            request.toUpdateCommand(boardId),
            departmentCode,
            authentication.getName()
        );
        
        return ResponseEntity.ok(response);
    }

    // 게시글 삭제
    @DeleteMapping("/{departmentCode}/board/{boardId}")
    public ResponseEntity<Void> deleteBoard(
            @PathVariable String departmentCode,
            @PathVariable Long boardId,
            Authentication authentication) {
        
        log.info("Deleting board: {} in department: {}", boardId, departmentCode);
        
        commandService.delete(boardId, departmentCode, authentication.getName());
        
        return ResponseEntity.noContent().build();
    }

    // 게시글 고정/해제
    @PostMapping("/{departmentCode}/board/{boardId}/pin")
    public ResponseEntity<Void> togglePin(
            @PathVariable String departmentCode,
            @PathVariable Long boardId,
            Authentication authentication) {
        
        log.info("Toggling pin for board: {} in department: {}", boardId, departmentCode);
        
        commandService.togglePin(boardId, departmentCode, authentication.getName());
        
        return ResponseEntity.ok().build();
    }

    // 유튜브 최신 영상 수동 업데이트 (관리자용)
    @PostMapping("/{departmentCode}/youtube/update")
    public ResponseEntity<String> updateYouTubeVideo(
            @PathVariable String departmentCode,
            Authentication authentication) {
        
        log.info("Manual YouTube video update requested for: {}", departmentCode);
        
        youTubeUpdateService.updateDepartmentVideoByCode(departmentCode);
        
        return ResponseEntity.ok("YouTube 영상 업데이트 완료");
    }

    // 모든 부서 유튜브 영상 업데이트 (관리자용)
    @PostMapping("/youtube/update-all")
    public ResponseEntity<String> updateAllYouTubeVideos(Authentication authentication) {
        
        log.info("Manual YouTube video update requested for all departments");
        
        youTubeUpdateService.updateAllDepartmentVideos();
        
        return ResponseEntity.ok("모든 부서 YouTube 영상 업데이트 완료");
    }
}
