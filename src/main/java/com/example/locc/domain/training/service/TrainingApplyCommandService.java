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

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TrainingApplyCommandService {

    private final TrainingApplicationRepository applicationRepository;
    private final TrainingApplyQueryService     applyQueryService;
    private final TrainingQueryService          trainingQueryService;
    private final UserRepository                userRepository;

    public ApplicationResponse apply(CreateApplicationCommand command, String email) {
        log.debug("Applying for training: {}", command.trainingId());
        User user = findUserByEmail(email);
        Training training = trainingQueryService.findDetailById(command.trainingId());

        if (!training.canApply()) {
            throw new InvalidInputException("현재 신청할 수 없는 훈련입니다");
        }
        if (applicationRepository.existsByTrainingIdAndUserId(command.trainingId(), user.getId())) {
            throw new InvalidInputException("이미 신청한 훈련입니다");
        }

        TrainingApplication application = TrainingApplication.create(command, training, user);
        return ApplicationResponse.from(applicationRepository.save(application));
    }

    public void cancel(Long applicationId, String email) {
        log.debug("Canceling application: {}", applicationId);
        TrainingApplication application = applyQueryService.findDetailById(applicationId);
        User user = findUserByEmail(email);

        if (!application.canModify(user)) {
            throw new AccessDeniedException("신청을 취소할 권한이 없습니다");
        }
        applicationRepository.delete(application);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));
    }
}
