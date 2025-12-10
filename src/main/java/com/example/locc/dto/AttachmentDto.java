package com.example.locc.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachmentDto {
    private Long id;
    private String originalFilename;
    private String storedFilename;
    private Long fileSize;
    private String contentType;
}
