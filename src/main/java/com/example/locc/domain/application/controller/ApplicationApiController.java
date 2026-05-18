package com.example.locc.domain.application.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.common.PageResponse;
import com.example.locc.domain.application.dto.request.FacilityApplicationRequest;
import com.example.locc.domain.application.dto.response.FacilityCategoryResponse;
import com.example.locc.domain.application.dto.response.FacilityApplicationDetailResponse;
import com.example.locc.domain.application.dto.response.FacilityApplicationResponse;
import com.example.locc.domain.application.service.FacilityCommandService;
import com.example.locc.domain.application.service.FacilityQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/facility-applications")
@RequiredArgsConstructor
public class ApplicationApiController {

    private final FacilityCommandService commandService;
    private final FacilityQueryService   queryService;

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<FacilityCategoryResponse>>> categories() {
        return ResponseEntity.ok(ApiResponse.ok(queryService.findActiveCategories()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FacilityApplicationDetailResponse>> create(
            @Valid @RequestBody FacilityApplicationRequest request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.created(commandService.create(request.toCreateCommand(authentication.getName()))));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<PageResponse<FacilityApplicationResponse>>> myList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(
                PageResponse.from(queryService.findMyList(authentication.getName(), page, size))));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FacilityApplicationDetailResponse>> detail(
            @PathVariable Long id,
            Authentication authentication) {
        // [SECURITY] IDOR 방지: 본인 신청서 또는 ADMIN/OPERATOR만 조회 가능
        return ResponseEntity.ok(ApiResponse.ok(queryService.findDetailForUser(id, authentication.getName())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancel(
            @PathVariable Long id, Authentication authentication) {
        commandService.cancel(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
