package com.example.locc.domain.admin.controller;

import com.example.locc.domain.sermon.dto.response.SermonResponse;
import com.example.locc.domain.sermon.service.SermonCommandService;
import com.example.locc.domain.sermon.service.SermonQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    private final SermonQueryService sermonQueryService;

    /**
     * 설교 목록 조회 (비동기)
     */
    @GetMapping
    public ResponseEntity<List<SermonResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.debug("관리자 설교 목록 조회: page={}, size={}", page, size);
        
        int offset = page * size;
        List<SermonResponse> sermons = sermonQueryService.findLatest(offset + size)
                .stream()
                .skip(offset)
                .limit(size)
                .toList();
        
        return ResponseEntity.ok(sermons);
    }

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
