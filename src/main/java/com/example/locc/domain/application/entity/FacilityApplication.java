package com.example.locc.domain.application.entity;

import com.example.locc.domain.application.dto.command.FacilityCreateCommand;
import com.example.locc.domain.user.entity.User;
import com.example.locc.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "facility_applications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(access = AccessLevel.PRIVATE)
public class FacilityApplication extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private FacilityCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", columnDefinition = "BINARY(16)", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate useDate;

    @Column(nullable = false)
    private LocalTime useStartTime;

    @Column(nullable = false)
    private LocalTime useEndTime;

    @Column(nullable = false, length = 200)
    private String purpose;

    @Column(nullable = false)
    private Integer headCount;

    @Column(columnDefinition = "TEXT")
    private String memo;

    @Column(columnDefinition = "TEXT")
    private String adminMemo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private FacilityApplicationStatus status = FacilityApplicationStatus.PENDING;

    // ===== 팩토리 메서드 =====

    public static FacilityApplication create(FacilityCreateCommand command,
                                             FacilityCategory category,
                                             User user) {
        return FacilityApplication.builder()
                .category(category)
                .user(user)
                .useDate(command.getUseDate())
                .useStartTime(command.getUseStartTime())
                .useEndTime(command.getUseEndTime())
                .purpose(command.getPurpose())
                .headCount(command.getHeadCount())
                .memo(command.getMemo())
                .status(FacilityApplicationStatus.PENDING)
                .build();
    }

    // ===== 비즈니스 메서드 =====

    public void complete() { this.status = FacilityApplicationStatus.COMPLETED; }

    public void updateAdminMemo(String adminMemo) { this.adminMemo = adminMemo; }

    public boolean isOwner(User user) { return this.user.getId().equals(user.getId()); }

    public boolean canCancel(User user) {
        return isOwner(user) && this.status == FacilityApplicationStatus.PENDING;
    }
}
