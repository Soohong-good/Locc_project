package com.example.locc.domain.training.service;

import com.example.locc.domain.training.dto.response.ApplicationResponse;
import com.example.locc.domain.training.entity.TrainingApplication;
import com.example.locc.domain.training.repository.TrainingApplicationRepository;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TrainingApplyQueryService {

    private final TrainingApplicationRepository applicationRepository;
    private final UserRepository                userRepository;

    public TrainingApplication findDetailById(Long id) {
        return applicationRepository.findDetailById(id)
                .orElseThrow(() -> new NotFoundException("신청서를 찾을 수 없습니다: " + id));
    }

    public ApplicationResponse getDetail(Long id) {
        return ApplicationResponse.from(findDetailById(id));
    }

    /**
     * [SECURITY] IDOR 방지: 본인 신청서 또는 ADMIN/OPERATOR만 조회 허용
     */
    public ApplicationResponse getDetailForUser(Long id, String requestEmail) {
        TrainingApplication application = findDetailById(id);
        User requester = userRepository.findByEmail(requestEmail)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        boolean isOwner = application.getUser().getEmail().equals(requestEmail);
        boolean isAdminOrOperator = requester.isAdmin() || requester.isOperator();

        if (!isOwner && !isAdminOrOperator) {
            throw new AccessDeniedException("본인의 신청서만 조회할 수 있습니다.");
        }
        return ApplicationResponse.from(application);
    }

    public Page<ApplicationResponse> getListByTraining(Long trainingId, Pageable pageable) {
        return applicationRepository.findByTrainingId(trainingId, pageable)
                .map(ApplicationResponse::from);
    }

    public List<ApplicationResponse> getAllByTraining(Long trainingId) {
        return applicationRepository.findAllByTrainingId(trainingId).stream()
                .map(ApplicationResponse::from)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponse> getMyApplications(UUID userId) {
        return applicationRepository.findByUserId(userId).stream()
                .map(ApplicationResponse::from)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponse> getMyApplicationsByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
        return applicationRepository.findByUserId(user.getId()).stream()
                .map(ApplicationResponse::from)
                .collect(Collectors.toList());
    }

    public long countByTraining(Long trainingId) {
        return applicationRepository.countByTrainingId(trainingId);
    }

    public boolean canParticipate(Long trainingId, UUID userId) {
        return applicationRepository.existsByTrainingIdAndUserId(trainingId, userId);
    }
}
