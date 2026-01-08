package com.example.locc.domain.staff.dto.command;

import com.example.locc.domain.staff.entity.Staff;
import lombok.Builder;
import lombok.Getter;

/**
 * Staff 생성 커맨드
 * Service 레이어에서 사용하는 내부 DTO
 */
@Getter
@Builder
public class StaffCreateCommand {
    
    private final String name;
    private final String englishName;
    private final Staff.StaffPosition position;
    private final Staff.StaffCategory category;
    private final Boolean isSeniorPastor;
    private final String customPosition;
    private final String responsibility;
    private final String imagePath;
    private final Integer displayOrder;
    private final String createdByEmail;
}
