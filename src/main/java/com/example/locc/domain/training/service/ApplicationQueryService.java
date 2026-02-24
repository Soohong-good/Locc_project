package com.example.locc.domain.training.service;

import com.example.locc.domain.training.dto.response.ApplicationResponse;
import com.example.locc.domain.training.entity.TrainingApplication;
import com.example.locc.domain.training.repository.TrainingApplicationRepository;
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
 * TrainingApplication 조회 전용 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApplicationQueryService {

    private final TrainingApplicationRepository applicationRepository;

    /**
     * 신청서 상세 조회 (Entity 반환 - 내부용)
     */
    public TrainingApplication findDetailById(Long id) {
        return applicationRepository.findDetailById(id)
                .orElseThrow(() -> new NotFoundException("신청서를 찾을 수 없습니다: " + id));
    }

    /**
     * 신청서 상세 조회 (Response 반환 - API용)
     */
    public ApplicationResponse getDetail(Long id) {
        TrainingApplication application = findDetailById(id);
        return ApplicationResponse.from(application);
    }

    /**
     * 특정 훈련의 신청자 목록
     */
    public Page<ApplicationResponse> getListByTraining(Long trainingId, Pageable pageable) {
        return applicationRepository.findByTrainingId(trainingId, pageable)
                .map(ApplicationResponse::from);
    }

    /**
     * 특정 훈련의 전체 신청자 목록 (엑셀용)
     */
    public List<ApplicationResponse> getAllByTraining(Long trainingId) {
        return applicationRepository.findAllByTrainingId(trainingId).stream()
                .map(ApplicationResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 사용자의 신청 내역
     */
    public List<ApplicationResponse> getMyApplications(java.util.UUID userId) {
        return applicationRepository.findByUserId(userId).stream()
                .map(ApplicationResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 특정 훈련의 신청자 수
     */
    public long countByTraining(Long trainingId) {
        return applicationRepository.countByTrainingId(trainingId);
    }

    /**
     * 훈련 참여 가능 여부 확인
     */
    public boolean canParticipate(Long trainingId, java.util.UUID userId) {
        return applicationRepository.existsByTrainingIdAndUserId(trainingId, userId);
    }
}
