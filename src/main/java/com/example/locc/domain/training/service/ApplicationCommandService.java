package com.example.locc.domain.training.service;

import com.example.locc.domain.training.dto.command.CreateApplicationCommand;
import com.example.locc.domain.training.dto.response.ApplicationResponse;
import com.example.locc.domain.training.entity.Training;
import com.example.locc.domain.training.entity.TrainingApplication;
import com.example.locc.domain.training.repository.TrainingApplicationRepository;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.exception.AccessDeniedException;
import com.example.locc.exception.InvalidInputException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * TrainingApplication 명령 전용 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ApplicationCommandService {

    private final TrainingApplicationRepository applicationRepository;
    private final ApplicationQueryService applicationQueryService;
    private final TrainingQueryService trainingQueryService;
    private final UserRepository userRepository;

    /**
     * 훈련 신청
     */
    public ApplicationResponse apply(CreateApplicationCommand command, String email) {
        log.info("Applying for training: {} by {}", command.trainingId(), email);

        User user = findUserByEmail(email);
        Training training = trainingQueryService.findDetailById(command.trainingId());

        // 신청 가능 여부 확인
        if (!training.canApply()) {
            throw new InvalidInputException("현재 신청할 수 없는 훈련입니다");
        }

        // 중복 신청 체크
        if (applicationRepository.existsByTrainingIdAndUserId(command.trainingId(), user.getId())) {
            throw new InvalidInputException("이미 신청한 훈련입니다");
        }

        TrainingApplication application = TrainingApplication.create(command, training, user);
        TrainingApplication savedApplication = applicationRepository.save(application);

        return ApplicationResponse.from(savedApplication);
    }

    /**
     * 신청 취소 (사용자)
     */
    public void cancel(Long applicationId, String email) {
        log.info("Canceling application: {} by {}", applicationId, email);

        TrainingApplication application = applicationQueryService.findDetailById(applicationId);
        User user = findUserByEmail(email);

        // 본인 또는 관리자 확인
        if (!application.canModify(user)) {
            throw new AccessDeniedException("신청을 취소할 권한이 없습니다");
        }

        applicationRepository.delete(application);
    }

    /**
     * 사용자 조회
     */
    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + email));
    }
}
