package com.example.locc.domain.training.entity;

import com.example.locc.domain.training.dto.command.CreateApplicationCommand;
import com.example.locc.domain.user.entity.User;
import com.example.locc.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 훈련 신청서 엔티티
 */
@Entity
@Table(
    name = "training_application",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_training_user",
        columnNames = {"training_id", "user_id"}
    )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class TrainingApplication extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_id", nullable = false)
    private Training training;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(length = 20)
    private String paymentMethod;

    @Column(nullable = false)
    private LocalDateTime appliedAt;

    /**
     * 신청서 생성 정적 팩토리 메서드
     */
    public static TrainingApplication create(CreateApplicationCommand command, Training training, User user) {
        return TrainingApplication.builder()
                .training(training)
                .user(user)
                .phone(command.phone())
                .paymentMethod(command.paymentMethod())
                .appliedAt(LocalDateTime.now())
                .build();
    }

    /**
     * 수정 권한 확인 (본인 또는 관리자)
     */
    public boolean canModify(User user) {
        if (user == null) {
            return false;
        }
        return user.isAdmin() || this.user.getId().equals(user.getId());
    }
}
