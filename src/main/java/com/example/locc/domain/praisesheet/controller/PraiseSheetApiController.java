package com.example.locc.domain.praisesheet.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.common.PageResponse;
import com.example.locc.domain.praisesheet.dto.request.PraiseSheetRequest;
import com.example.locc.domain.praisesheet.dto.request.PraiseSheetSearchCondition;
import com.example.locc.domain.praisesheet.dto.response.PraiseSheetDetailResponse;
import com.example.locc.domain.praisesheet.dto.response.PraiseSheetResponse;
import com.example.locc.domain.praisesheet.service.PraiseSheetCommandService;
import com.example.locc.domain.praisesheet.service.PraiseSheetQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/praise-sheets")
@RequiredArgsConstructor
public class PraiseSheetApiController {

    private final PraiseSheetCommandService commandService;
    private final PraiseSheetQueryService queryService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PraiseSheetResponse>>> list(
            @ModelAttribute PraiseSheetSearchCondition condition) {
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(queryService.findList(condition))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PraiseSheetDetailResponse>> detail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(queryService.findDetail(id)));
    }

    @PostMapping("/{id}/views")
    public ResponseEntity<ApiResponse<Void>> increaseViews(@PathVariable Long id) {
        commandService.increaseViews(id);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PraiseSheetDetailResponse>> create(
            @Valid @ModelAttribute PraiseSheetRequest request,
            Authentication authentication) {
        PraiseSheetDetailResponse response = commandService.create(request.toCreateCommand(authentication.getName()));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PraiseSheetDetailResponse>> update(
            @PathVariable Long id,
            @Valid @ModelAttribute PraiseSheetRequest request,
            Authentication authentication) {
        PraiseSheetDetailResponse response = commandService.update(request.toUpdateCommand(id, authentication.getName()));
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/upload-image")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(
            @RequestParam("image") MultipartFile image,
            Authentication authentication) {
        String url = commandService.uploadContentImage(image, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(Map.of("url", url)));
    }

    @PatchMapping("/{id}/pin")
    public ResponseEntity<ApiResponse<Void>> togglePin(
            @PathVariable Long id, Authentication authentication) {
        commandService.togglePin(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id, Authentication authentication) {
        commandService.delete(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
