package com.example.locc.domain.notice.controller;

import com.example.locc.domain.notice.dto.command.NoticeCreateCommand;
import com.example.locc.domain.notice.dto.command.NoticeUpdateCommand;
import com.example.locc.domain.notice.dto.request.NoticeRequest;
import com.example.locc.domain.notice.dto.request.NoticeSearchCondition;
import com.example.locc.domain.notice.dto.response.NoticeDetailResponse;
import com.example.locc.domain.notice.dto.response.NoticeResponse;
import com.example.locc.domain.notice.service.NoticeCommandService;
import com.example.locc.domain.notice.service.NoticeQueryService;
import com.example.locc.domain.file.entity.File;
import com.example.locc.domain.file.service.FileCommandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * Notice API Controller
 * - 공개 API: 조회만 담당
 * - 수정/삭제는 /api/admin/notices/** 사용
 */
@Slf4j
@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeApiController {

    private final NoticeCommandService noticeCommandService;
    private final NoticeQueryService noticeQueryService;
    private final FileCommandService fileCommandService;

    /**
     * 목록 조회
     */
    @GetMapping
    public ResponseEntity<Page<NoticeResponse>> list(@ModelAttribute NoticeSearchCondition condition) {
        Page<NoticeResponse> notices = noticeQueryService.findList(condition);
        return ResponseEntity.ok(notices);
    }

    /**
     * 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<NoticeDetailResponse> detail(@PathVariable Long id) {
        NoticeDetailResponse notice = noticeQueryService.findDetail(id);
        return ResponseEntity.ok(notice);
    }

    /**
     * 고정된 공지사항 조회
     */
    @GetMapping("/pinned")
    public ResponseEntity<List<NoticeResponse>> pinned() {
        List<NoticeResponse> notices = noticeQueryService.findPinned();
        return ResponseEntity.ok(notices);
    }

    /**
     * 조회수 증가
     */
    @PostMapping("/{id}/views")
    public ResponseEntity<Void> increaseViews(@PathVariable Long id) {
        noticeCommandService.increaseViews(id);
        return ResponseEntity.ok().build();
    }
}
