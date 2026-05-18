package com.example.locc.domain.application.entity;

import com.example.locc.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * 시설·차량 신청 카테고리
 * - 관리자가 직접 추가/수정/삭제
 * - ex) 차량 신청, 건물 신청 등
 */
@Entity
@Table(name = "facility_categories")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(access = AccessLevel.PRIVATE)
public class FacilityCategory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    public static FacilityCategory create(String name, String description, Integer sortOrder) {
        return FacilityCategory.builder()
                .name(name)
                .description(description)
                .isActive(true)
                .sortOrder(sortOrder != null ? sortOrder : 0)
                .build();
    }

    public void update(String name, String description, Integer sortOrder) {
        this.name = name;
        this.description = description;
        if (sortOrder != null) this.sortOrder = sortOrder;
    }

    public void activate()   { this.isActive = true; }
    public void deactivate() { this.isActive = false; }
}
