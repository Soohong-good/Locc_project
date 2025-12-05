package com.example.locc.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SermonDto {

    private Long id;
    private String title;
    private String scripture;
    private String preacher;
    private String content;
    private String audioUrl;
    private String videoUrl;
    private String thumbnailUrl;
    private LocalDateTime sermonDate;
    
    // 작성자 정보
    private UUID createdById;
    private String createdByEmail;
    private String createdByName;
    
    private LocalDateTime createdAt;
}