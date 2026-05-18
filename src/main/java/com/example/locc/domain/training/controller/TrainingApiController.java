package com.example.locc.domain.training.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.common.PageResponse;
import com.example.locc.domain.training.dto.request.TrainingRequest;
import com.example.locc.domain.training.dto.response.TrainingDetailResponse;
import com.example.locc.domain.training.dto.response.TrainingResponse;
import com.example.locc.domain.training.entity.TrainingStatus;
import com.example.locc.domain.training.service.TrainingCommandService;
import com.example.locc.domain.training.service.TrainingQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Training API Controller
 * - 공개 API: 조회
 * - 관리자 API: 생성, 수정, 삭제 (ADMIN 권한 필요)
 */
@Slf4j
@RestController
@RequestMapping("/api/trainings")
@RequiredArgsConstructor
public class TrainingApiController {

    private final TrainingCommandService trainingCommandService;
    private final TrainingQueryService trainingQueryService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TrainingResponse>>> list(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(trainingQueryService.getList(pageable))));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<PageResponse<TrainingResponse>>> listByStatus(
            @PathVariable TrainingStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(trainingQueryService.getListByStatus(status, pageable))));
    }

    @GetMapping("/open")
    public ResponseEntity<ApiResponse<List<TrainingResponse>>> openTrainings() {
        return ResponseEntity.ok(ApiResponse.ok(trainingQueryService.getOpenTrainings()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TrainingDetailResponse>> detail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(trainingQueryService.getDetail(id)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<TrainingResponse>>> search(
            @RequestParam String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(trainingQueryService.search(keyword, pageable))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TrainingDetailResponse>> create(
            @Valid @RequestBody TrainingRequest request,
            Authentication authentication) {
        log.debug("훈련 생성 요청: title={}", request.getTitle());
        TrainingDetailResponse response = trainingCommandService.create(request.toCreateCommand(), authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TrainingDetailResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody TrainingRequest request,
            Authentication authentication) {
        log.debug("훈련 수정 요청: id={}", id);
        TrainingDetailResponse response = trainingCommandService.update(id, request.toUpdateCommand(), authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id, Authentication authentication) {
        log.debug("훈련 삭제 요청: id={}", id);
        trainingCommandService.delete(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<ApiResponse<Void>> close(@PathVariable Long id, Authentication authentication) {
        log.debug("훈련 신청 마감 요청: id={}", id);
        trainingCommandService.close(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok());
    }

}
