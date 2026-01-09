package com.example.locc.domain.admin.controller;

import com.example.locc.domain.sermon.service.SermonCommandService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * 관리자 전용 설교 API Controller
 * - 행동(action)만 담당: DELETE
 * - 목록 조회는 AdminViewController에서 처리
 * - 생성/수정 폼은 기존 도메인 재사용
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/sermons")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminSermonApiController {

    private final SermonCommandService sermonCommandService;

    /**
     * 설교 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication) {
        
        log.info("관리자 설교 삭제 요청: id={}, user={}", id, authentication.getName());
        sermonCommandService.delete(id, authentication.getName());
        
        return ResponseEntity.noContent().build();
    }
}
