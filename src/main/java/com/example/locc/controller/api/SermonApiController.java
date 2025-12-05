package com.example.locc.controller.api;

import com.example.locc.dto.SermonDto;
import com.example.locc.service.SermonService;
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
@RequestMapping("/api/sermons")
@RequiredArgsConstructor
public class SermonApiController {

    private final SermonService sermonService;

    @GetMapping
    public ResponseEntity<Page<SermonDto>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("API: Fetching all sermons - page: {}, size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<SermonDto> sermons = sermonService.findRecent(pageable);
        return ResponseEntity.ok(sermons);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SermonDto> getById(@PathVariable Long id) {
        log.info("API: Fetching sermon by id: {}", id);
        SermonDto sermon = sermonService.findById(id);
        return ResponseEntity.ok(sermon);
    }

    @GetMapping("/latest")
    public ResponseEntity<SermonDto> getLatest() {
        log.info("API: Fetching latest sermon");
        SermonDto sermon = sermonService.findLatest();
        return ResponseEntity.ok(sermon);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<SermonDto>> getRecent(
            @RequestParam(defaultValue = "5") int limit) {

        log.info("API: Fetching recent sermons - limit: {}", limit);
        List<SermonDto> sermons = sermonService.findRecent(limit);
        return ResponseEntity.ok(sermons);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<SermonDto>> search(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("API: Searching sermons - keyword: {}, page: {}, size: {}", keyword, page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<SermonDto> sermons = sermonService.search(keyword, pageable);
        return ResponseEntity.ok(sermons);
    }

    @GetMapping("/preacher/{preacher}")
    public ResponseEntity<Page<SermonDto>> getByPreacher(
            @PathVariable String preacher,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("API: Fetching sermons by preacher: {} - page: {}, size: {}", preacher, page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<SermonDto> sermons = sermonService.findByPreacher(preacher, pageable);
        return ResponseEntity.ok(sermons);
    }

    @PostMapping
    public ResponseEntity<SermonDto> create(
            @Valid @RequestBody SermonDto sermonDto,
            Authentication authentication) {

        String username = authentication.getName();
        log.info("API: Creating sermon - title: {} by user: {}", sermonDto.getTitle(), username);

        SermonDto createdSermon = sermonService.create(sermonDto, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSermon);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SermonDto> update(
            @PathVariable Long id,
            @Valid @RequestBody SermonDto sermonDto,
            Authentication authentication) {

        String username = authentication.getName();
        log.info("API: Updating sermon id: {} by user: {}", id, username);

        SermonDto updatedSermon = sermonService.update(id, sermonDto, username);
        return ResponseEntity.ok(updatedSermon);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication) {

        String username = authentication.getName();
        log.info("API: Deleting sermon id: {} by user: {}", id, username);

        sermonService.delete(id, username);
        return ResponseEntity.noContent().build();
    }
}