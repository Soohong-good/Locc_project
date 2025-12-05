package com.example.locc.controller.api;

import com.example.locc.dto.NoticeDto;
import com.example.locc.service.NoticeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeApiController {

    private final NoticeService noticeService;

    @GetMapping
    public ResponseEntity<Page<NoticeDto>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("API: Fetching all notices - page: {}, size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<NoticeDto> notices = noticeService.findAll(pageable);
        return ResponseEntity.ok(notices);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NoticeDto> getById(@PathVariable Long id) {
        log.info("API: Fetching notice by id: {}", id);
        NoticeDto notice = noticeService.findById(id);
        return ResponseEntity.ok(notice);
    }

    @GetMapping("/pinned")
    public ResponseEntity<List<NoticeDto>> getPinned() {
        log.info("API: Fetching pinned notices");
        List<NoticeDto> notices = noticeService.findPinned();
        return ResponseEntity.ok(notices);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<NoticeDto>> search(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("API: Searching notices - keyword: {}, page: {}, size: {}", keyword, page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<NoticeDto> notices = noticeService.search(keyword, pageable);
        return ResponseEntity.ok(notices);
    }

    @PostMapping
    public ResponseEntity<NoticeDto> create(
            @Valid @RequestBody NoticeDto noticeDto,
            Authentication authentication) {

        String username = authentication.getName();
        log.info("API: Creating notice - title: {} by user: {}", noticeDto.getTitle(), username);

        NoticeDto createdNotice = noticeService.create(noticeDto, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNotice);
    }

    @PutMapping("/{id}")
    public ResponseEntity<NoticeDto> update(
            @PathVariable Long id,
            @Valid @RequestBody NoticeDto noticeDto,
            Authentication authentication) {

        String username = authentication.getName();
        log.info("API: Updating notice id: {} by user: {}", id, username);

        NoticeDto updatedNotice = noticeService.update(id, noticeDto, username);
        return ResponseEntity.ok(updatedNotice);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication) {

        String username = authentication.getName();
        log.info("API: Deleting notice id: {} by user: {}", id, username);

        noticeService.delete(id, username);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<Void> increaseViews(@PathVariable Long id) {
        log.info("API: Increasing view count for notice id: {}", id);
        noticeService.increaseViews(id);
        return ResponseEntity.ok().build();
    }
}