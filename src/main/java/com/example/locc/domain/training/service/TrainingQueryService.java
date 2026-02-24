package com.example.locc.domain.training.service;

import com.example.locc.domain.training.dto.response.TrainingDetailResponse;
import com.example.locc.domain.training.dto.response.TrainingResponse;
import com.example.locc.domain.training.entity.Training;
import com.example.locc.domain.training.entity.TrainingStatus;
import com.example.locc.domain.training.repository.TrainingRepository;
import com.example.locc.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Training 조회 전용 서비스
 * - 읽기 작업만 처리
 * - readOnly 트랜잭션
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TrainingQueryService {

    private final TrainingRepository trainingRepository;

    /**
     * 훈련 상세 조회 (Entity 반환 - 내부용)
     */
    public Training findDetailById(Long id) {
        return trainingRepository.findDetailById(id)
                .orElseThrow(() -> new NotFoundException("훈련을 찾을 수 없습니다: " + id));
    }

    /**
     * 훈련 상세 조회 (Response 반환 - API용)
     */
    public TrainingDetailResponse getDetail(Long id) {
        Training training = findDetailById(id);
        return TrainingDetailResponse.from(training);
    }

    /**
     * 훈련 목록 조회 (페이징)
     */
    public Page<TrainingResponse> getList(Pageable pageable) {
        return trainingRepository.findList(pageable)
                .map(TrainingResponse::from);
    }

    /**
     * 상태별 훈련 목록 조회
     */
    public Page<TrainingResponse> getListByStatus(TrainingStatus status, Pageable pageable) {
        return trainingRepository.findByStatus(status, pageable)
                .map(TrainingResponse::from);
    }

    /**
     * 신청 가능한 훈련 목록 조회
     */
    public List<TrainingResponse> getOpenTrainings() {
        return trainingRepository.findOpenTrainings().stream()
                .map(TrainingResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 훈련 검색
     */
    public Page<TrainingResponse> search(String keyword, Pageable pageable) {
        return trainingRepository.search(keyword, pageable)
                .map(TrainingResponse::from);
    }
}
