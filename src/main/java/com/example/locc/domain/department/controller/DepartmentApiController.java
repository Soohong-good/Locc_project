package com.example.locc.domain.department.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.domain.department.dto.request.DepartmentBoardRequest;
import com.example.locc.domain.department.dto.response.DepartmentBoardDetailResponse;
import com.example.locc.domain.department.service.DepartmentCommandService;
import com.example.locc.domain.department.service.DepartmentYouTubeUpdateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
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

    @PostMapping("/{departmentCode}/board")
    public ResponseEntity<ApiResponse<DepartmentBoardDetailResponse>> createBoard(
            @PathVariable String departmentCode,
            @Valid @RequestBody DepartmentBoardRequest request,
            Authentication authentication) {

        log.info("Creating board for department: {}", departmentCode);
        DepartmentBoardDetailResponse response = commandService.create(
                request.toCreateCommand(departmentCode), authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    @PutMapping("/{departmentCode}/board/{boardId}")
    public ResponseEntity<ApiResponse<DepartmentBoardDetailResponse>> updateBoard(
            @PathVariable String departmentCode,
            @PathVariable Long boardId,
            @Valid @RequestBody DepartmentBoardRequest request,
            Authentication authentication) {

        log.info("Updating board: {} in department: {}", boardId, departmentCode);
        DepartmentBoardDetailResponse response = commandService.update(
                request.toUpdateCommand(boardId), departmentCode, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @DeleteMapping("/{departmentCode}/board/{boardId}")
    public ResponseEntity<ApiResponse<Void>> deleteBoard(
            @PathVariable String departmentCode,
            @PathVariable Long boardId,
            Authentication authentication) {

        log.info("Deleting board: {} in department: {}", boardId, departmentCode);
        commandService.delete(boardId, departmentCode, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/{departmentCode}/board/{boardId}/pin")
    public ResponseEntity<ApiResponse<Void>> togglePin(
            @PathVariable String departmentCode,
            @PathVariable Long boardId,
            Authentication authentication) {

        log.info("Toggling pin for board: {} in department: {}", boardId, departmentCode);
        commandService.togglePin(boardId, departmentCode, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/{departmentCode}/youtube/update")
    public ResponseEntity<ApiResponse<Void>> updateYouTubeVideo(
            @PathVariable String departmentCode,
            Authentication authentication) {

        log.info("Manual YouTube video update requested for: {}", departmentCode);
        youTubeUpdateService.updateDepartmentVideoByCode(departmentCode);
        return ResponseEntity.ok(ApiResponse.ok(null, "YouTube 영상 업데이트 완료"));
    }

    @PostMapping("/youtube/update-all")
    public ResponseEntity<ApiResponse<Void>> updateAllYouTubeVideos(Authentication authentication) {
        log.info("Manual YouTube video update requested for all departments");
        youTubeUpdateService.updateAllDepartmentVideos();
        return ResponseEntity.ok(ApiResponse.ok(null, "모든 부서 YouTube 영상 업데이트 완료"));
    }
}
