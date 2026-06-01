package com.example.locc.domain.staff.entity;

import com.example.locc.domain.staff.dto.command.StaffCreateCommand;
import com.example.locc.domain.staff.dto.command.StaffUpdateCommand;
import com.example.locc.entity.BaseEntity;
import com.example.locc.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

/**
 * Staff 도메인 엔티티
 * - 불변성을 위해 Setter 제거
 * - 팩토리 메서드로 생성
 * - 비즈니스 로직을 Entity에 응집
 */
@Entity
@Table(name = "staff")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(access = AccessLevel.PRIVATE)
public class Staff extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 100)
    private String englishName;

    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private StaffPosition position;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StaffCategory category = StaffCategory.MINISTER;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isSeniorPastor = false;

    @Column(length = 50)
    private String customPosition;

    @Column(length = 1000)
    private String responsibility;

    @Column(length = 500)
    private String imagePath;

    @Column(nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    // Enum 정의
    public enum StaffPosition {
        PASTOR,         // 목사
        EVANGELIST,     // 전도사
        OTHER           // 기타
    }

    public enum StaffCategory {
        MINISTER,       // 교역자
        EMPLOYEE,       // 교회 직원
        ELDER           // 장로 (customPosition: 원로 | 은퇴 | 시무)
    }

    // ===== 팩토리 메서드 =====
    
    /**
     * Staff 생성
     */
    public static Staff create(StaffCreateCommand command) {
        return Staff.builder()
                .name(command.getName())
                .englishName(command.getEnglishName())
                .position(command.getPosition())
                .category(command.getCategory() != null ? command.getCategory() : StaffCategory.MINISTER)
                .isSeniorPastor(command.getIsSeniorPastor() != null ? command.getIsSeniorPastor() : false)
                .customPosition(command.getCustomPosition())
                .responsibility(command.getResponsibility())
                .imagePath(command.getImagePath())
                .displayOrder(command.getDisplayOrder() != null ? command.getDisplayOrder() : 0)
                .build();
    }

    // ===== 비즈니스 메서드 =====
    
    /**
     * Staff 정보 수정
     */
    public void update(StaffUpdateCommand command) {
        this.name = command.getName();
        this.englishName = command.getEnglishName();
        this.position = command.getPosition();
        this.category = command.getCategory() != null ? command.getCategory() : this.category;
        this.isSeniorPastor = command.getIsSeniorPastor() != null ? command.getIsSeniorPastor() : false;
        this.customPosition = command.getCustomPosition();
        this.responsibility = command.getResponsibility();
        this.displayOrder = command.getDisplayOrder() != null ? command.getDisplayOrder() : this.displayOrder;
    }

    /**
     * 이미지 경로 업데이트
     */
    public void updateImage(String imagePath) {
        this.imagePath = imagePath;
    }

    /**
     * 담임목사로 설정
     */
    public void setSeniorPastor() {
        this.isSeniorPastor = true;
    }

    /**
     * 담임목사 해제
     */
    public void unsetSeniorPastor() {
        this.isSeniorPastor = false;
    }

    // ===== 권한 검증 =====
    
    /**
     * 수정 권한 확인 (총관리자 또는 운영자)
     */
    public boolean canModify(User user) {
        return user.isAdminOrOperator();
    }
}
