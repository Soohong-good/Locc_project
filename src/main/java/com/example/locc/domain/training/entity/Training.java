package com.example.locc.domain.training.entity;

import com.example.locc.domain.training.dto.command.CreateTrainingCommand;
import com.example.locc.domain.user.entity.User;
import com.example.locc.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 훈련 프로그램 엔티티
 */
@Entity
@Table(name = "training")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class Training extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private LocalDateTime applicationDeadline;

    @Column(nullable = false)
    private int trainingFee;

    @Column(nullable = false)
    private int maxParticipants;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TrainingStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    /**
     * 훈련 생성 정적 팩토리 메서드
     */
    public static Training create(CreateTrainingCommand command, User creator) {
        return Training.builder()
                .title(command.title())
                .description(command.description())
                .startDate(command.startDate())
                .endDate(command.endDate())
                .applicationDeadline(command.applicationDeadline())
                .trainingFee(command.trainingFee())
                .maxParticipants(command.maxParticipants())
                .status(TrainingStatus.OPEN)
                .createdBy(creator)
                .build();
    }

    /**
     * 훈련 정보 수정
     */
    public void update(String title, String description, LocalDate startDate, 
                      LocalDate endDate, LocalDateTime applicationDeadline,
                      int trainingFee, int maxParticipants) {
        this.title = title;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.applicationDeadline = applicationDeadline;
        this.trainingFee = trainingFee;
        this.maxParticipants = maxParticipants;
    }

    /**
     * 신청 마감
     */
    public void close() {
        this.status = TrainingStatus.CLOSED;
    }

    /**
     * 현재 실제 상태 계산 (동적)
     * DB 저장된 status가 아닌, 현재 시점의 실제 상태를 반환
     */
    public TrainingStatus getCurrentStatus() {
        LocalDateTime now = LocalDateTime.now();
        
        // 신청 마감일이 지났으면 마감
        if (now.isAfter(this.applicationDeadline)) {
            return TrainingStatus.CLOSED;
        }
        
        // 관리자가 수동으로 마감한 경우
        if (this.status == TrainingStatus.CLOSED) {
            return TrainingStatus.CLOSED;
        }
        
        // 그 외는 신청가능
        return TrainingStatus.OPEN;
    }

    /**
     * 신청 가능 여부 확인
     */
    public boolean canApply() {
        return getCurrentStatus() == TrainingStatus.OPEN;
    }

    /**
     * 수정 권한 확인
     */
    public boolean canModify(User user) {
        if (user == null) {
            return false;
        }
        return user.isAdmin() || this.createdBy.getId().equals(user.getId());
    }
}
