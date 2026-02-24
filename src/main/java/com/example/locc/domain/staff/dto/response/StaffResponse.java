package com.example.locc.domain.staff.dto.response;

import com.example.locc.domain.staff.entity.Staff;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Staff 목록 조회 응답 DTO (API 전용)
 */
@Getter
@Builder
public class StaffResponse {

    private final Long id;
    private final String name;
    private final String englishName;
    private final Staff.StaffPosition position;
    private final Staff.StaffCategory category;
    private final Boolean isSeniorPastor;
    private final String customPosition;
    private final String responsibility;
    private final String imagePath;
    private final Integer displayOrder;
    private final LocalDateTime createdAt;
    
    // 프론트엔드용 추가 필드
    private final String positionEnglish;
    private final String categoryEnglish;
    
    /**
     * Entity to Response
     */
    public static StaffResponse from(Staff staff) {
        return StaffResponse.builder()
                .id(staff.getId())
                .name(staff.getName())
                .englishName(staff.getEnglishName())
                .position(staff.getPosition())
                .category(staff.getCategory())
                .isSeniorPastor(staff.getIsSeniorPastor())
                .customPosition(staff.getCustomPosition())
                .responsibility(staff.getResponsibility())
                .imagePath(staff.getImagePath())
                .displayOrder(staff.getDisplayOrder())
                .createdAt(staff.getCreatedAt())
                .positionEnglish(staff.getPosition().name())
                .categoryEnglish(staff.getCategory().name())
                .build();
    }
    
    /**
     * 화면 표시용 직분명 (템플릿에서 사용)
     */
    public String getDisplayPosition() {
        // customPosition이 있으면 우선 사용
        if (customPosition != null && !customPosition.isEmpty()) {
            return customPosition;
        }
        
        // 담임목사인 경우
        if (Boolean.TRUE.equals(isSeniorPastor) && position == Staff.StaffPosition.PASTOR) {
            return "담임목사";
        }
        
        // Enum을 한글로 변환
        return switch (position) {
            case PASTOR -> "목사";
            case EVANGELIST -> "전도사";
            case OTHER -> "기타";
        };
    }
}
