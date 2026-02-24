package com.example.locc.domain.training.controller;

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

    /**
     * 훈련 목록 조회
     */
    @GetMapping
    public ResponseEntity<Page<TrainingResponse>> list(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<TrainingResponse> trainings = trainingQueryService.getList(pageable);
        return ResponseEntity.ok(trainings);
    }

    /**
     * 상태별 훈련 목록 조회
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<TrainingResponse>> listByStatus(
            @PathVariable TrainingStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<TrainingResponse> trainings = trainingQueryService.getListByStatus(status, pageable);
        return ResponseEntity.ok(trainings);
    }

    /**
     * 신청 가능한 훈련 목록
     */
    @GetMapping("/open")
    public ResponseEntity<List<TrainingResponse>> openTrainings() {
        List<TrainingResponse> trainings = trainingQueryService.getOpenTrainings();
        return ResponseEntity.ok(trainings);
    }

    /**
     * 훈련 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<TrainingDetailResponse> detail(@PathVariable Long id) {
        TrainingDetailResponse training = trainingQueryService.getDetail(id);
        return ResponseEntity.ok(training);
    }

    /**
     * 훈련 검색
     */
    @GetMapping("/search")
    public ResponseEntity<Page<TrainingResponse>> search(
            @RequestParam String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<TrainingResponse> trainings = trainingQueryService.search(keyword, pageable);
        return ResponseEntity.ok(trainings);
    }

    /**
     * 훈련 생성 (관리자 전용)
     */
    @PostMapping
    public ResponseEntity<TrainingDetailResponse> create(
            @Valid @RequestBody TrainingRequest request,
            Authentication authentication) {

        log.info("훈련 생성: title={}, user={}", request.getTitle(), authentication.getName());

        TrainingDetailResponse response = trainingCommandService.create(
                request.toCreateCommand(),
                authentication.getName()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 훈련 수정 (관리자 전용)
     */
    @PutMapping("/{id}")
    public ResponseEntity<TrainingDetailResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody TrainingRequest request,
            Authentication authentication) {

        log.info("훈련 수정: id={}, user={}", id, authentication.getName());

        TrainingDetailResponse response = trainingCommandService.update(
                id,
                request.toUpdateCommand(),
                authentication.getName()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * 훈련 삭제 (관리자 전용)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication) {

        log.info("훈련 삭제: id={}, user={}", id, authentication.getName());

        trainingCommandService.delete(id, authentication.getName());

        return ResponseEntity.noContent().build();
    }

    /**
     * 신청 마감 (관리자 전용)
     */
    @PostMapping("/{id}/close")
    public ResponseEntity<Void> close(
            @PathVariable Long id,
            Authentication authentication) {

        log.info("훈련 신청 마감: id={}, user={}", id, authentication.getName());

        trainingCommandService.close(id, authentication.getName());

        return ResponseEntity.ok().build();
    }

}
