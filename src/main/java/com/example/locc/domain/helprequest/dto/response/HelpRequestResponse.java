package com.example.locc.domain.helprequest.dto.response;

import com.example.locc.domain.helprequest.entity.HelpRequest;
import com.example.locc.domain.helprequest.entity.HelpRequestStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 도움 요청 Response DTO
 */
@Getter
@Builder
public class HelpRequestResponse {

    private Long id;
    private String name;
    private String phone;
    private String email;
    private String content;
    private HelpRequestStatus status;
    private String statusDescription;
    private String adminMemo;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime updatedAt;

    /**
     * Entity -> Response 변환
     */
    public static HelpRequestResponse from(HelpRequest entity) {
        return HelpRequestResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .phone(entity.getPhone())
                .email(entity.getEmail())
                .content(entity.getContent())
                .status(entity.getStatus())
                .statusDescription(entity.getStatus().getDescription())
                .adminMemo(entity.getAdminMemo())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
