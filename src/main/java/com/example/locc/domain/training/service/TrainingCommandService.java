package com.example.locc.domain.training.service;

import com.example.locc.domain.training.dto.command.CreateTrainingCommand;
import com.example.locc.domain.training.dto.command.UpdateTrainingCommand;
import com.example.locc.domain.training.dto.response.TrainingDetailResponse;
import com.example.locc.domain.training.entity.Training;
import com.example.locc.domain.training.repository.TrainingRepository;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.exception.AccessDeniedException;
import com.example.locc.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Training 명령 전용 서비스
 * - CUD 작업만 처리
 * - 트랜잭션 관리
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TrainingCommandService {

    private final TrainingRepository trainingRepository;
    private final TrainingQueryService trainingQueryService;
    private final UserRepository userRepository;

    /**
     * 훈련 생성
     */
    public TrainingDetailResponse create(CreateTrainingCommand command, String email) {
        log.info("Creating training: {} by {}", command.title(), email);

        User creator = findUserByEmail(email);

        Training training = Training.create(command, creator);
        Training savedTraining = trainingRepository.save(training);

        return TrainingDetailResponse.from(savedTraining);
    }

    /**
     * 훈련 수정
     */
    public TrainingDetailResponse update(Long trainingId, UpdateTrainingCommand command, String email) {
        log.info("Updating training: {} by {}", trainingId, email);

        Training training = trainingQueryService.findDetailById(trainingId);
        User user = findUserByEmail(email);

        validateModifyPermission(training, user);

        training.update(
                command.title(),
                command.description(),
                command.startDate(),
                command.endDate(),
                command.applicationDeadline(),
                command.trainingFee(),
                command.maxParticipants()
        );

        return TrainingDetailResponse.from(training);
    }

    /**
     * 훈련 삭제
     */
    public void delete(Long trainingId, String email) {
        log.info("Deleting training: {} by {}", trainingId, email);

        Training training = trainingQueryService.findDetailById(trainingId);
        User user = findUserByEmail(email);

        validateModifyPermission(training, user);

        trainingRepository.delete(training);
    }

    /**
     * 신청 마감
     */
    public void close(Long trainingId, String email) {
        log.info("Closing training application: {} by {}", trainingId, email);

        Training training = trainingQueryService.findDetailById(trainingId);
        User user = findUserByEmail(email);

        validateModifyPermission(training, user);

        training.close();
    }



    /**
     * 사용자 조회 (헬퍼 메서드)
     */
    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + email));
    }

    /**
     * 수정 권한 검증
     */
    private void validateModifyPermission(Training training, User user) {
        if (!training.canModify(user)) {
            throw new AccessDeniedException("훈련을 수정할 권한이 없습니다");
        }
    }
}
