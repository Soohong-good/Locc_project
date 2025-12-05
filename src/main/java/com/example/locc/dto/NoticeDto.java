package com.example.locc.dto;

import lombok.*;

import java.time.LocalDateTime;
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
}