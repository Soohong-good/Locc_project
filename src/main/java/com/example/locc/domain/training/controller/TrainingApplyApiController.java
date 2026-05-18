package com.example.locc.domain.training.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.common.PageResponse;
import com.example.locc.domain.training.dto.request.ApplicationRequest;
import com.example.locc.domain.training.dto.response.ApplicationResponse;
import com.example.locc.domain.training.service.ApplicationExcelService;
import com.example.locc.domain.training.service.TrainingApplyCommandService;
import com.example.locc.domain.training.service.TrainingApplyQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * 훈련 신청 API Controller
 */
@Slf4j
@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class TrainingApplyApiController {

    private final TrainingApplyCommandService commandService;
    private final TrainingApplyQueryService   queryService;
    private final ApplicationExcelService     excelService;

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ApplicationResponse>> detail(
            @PathVariable Long id,
            Authentication authentication) {
        // [SECURITY] IDOR 방지: 신청자 본인 또는 ADMIN/OPERATOR만 조회 가능
        ApplicationResponse response = queryService.getDetailForUser(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/training/{trainingId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationResponse>>> listByTraining(
            @PathVariable Long trainingId,
            @PageableDefault(size = 50, sort = "appliedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        // [SECURITY] 신청자 목록은 ADMIN/OPERATOR 전용 (개인정보 포함)
        return ResponseEntity.ok(ApiResponse.ok(
                PageResponse.from(queryService.getListByTraining(trainingId, pageable))));
    }

    @GetMapping("/training/{trainingId}/excel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> downloadExcel(@PathVariable Long trainingId) {
        ApplicationExcelService.ExcelResult result = excelService.generateExcel(trainingId);
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        httpHeaders.setContentDisposition(
                ContentDisposition.attachment()
                        .filename(result.fileName(), StandardCharsets.UTF_8)
                        .build()
        );
        return new ResponseEntity<>(result.content(), httpHeaders, HttpStatus.OK);
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> myApplications(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(
                queryService.getMyApplicationsByEmail(authentication.getName())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ApplicationResponse>> apply(
            @Valid @RequestBody ApplicationRequest request,
            Authentication authentication) {
        log.info("훈련 신청: trainingId={}", request.getTrainingId());
        ApplicationResponse response = commandService.apply(request.toCommand(), authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancel(
            @PathVariable Long id, Authentication authentication) {
        log.debug("신청 취소: applicationId={}", id);
        commandService.cancel(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
