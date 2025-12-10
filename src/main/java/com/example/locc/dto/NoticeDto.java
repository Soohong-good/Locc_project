package com.example.locc.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeDto {

    private Long id;
    private String title;
    private String content;
    
    // 작성자 정보
    private UUID createdById;
    private String createdByEmail;
    private String createdByName;
    
    private Integer viewCount;
    private Boolean isPinned;
    private LocalDateTime createdAt;
    
    // 첨부파일 목록
    @Builder.Default
    private List<AttachmentDto> attachments = new ArrayList<>();
    
    // 7일 이내 작성된 공지사항인지 확인
    public boolean isNew() {
        if (createdAt == null) return false;
        LocalDateTime now = LocalDateTime.now();
        long daysBetween = ChronoUnit.DAYS.between(createdAt, now);
        return daysBetween <= 7;
    }
    
    // Lombok이 생성하는 getter와 충돌 방지
    public String getAuthorName() {
        return createdByName;
    }
}