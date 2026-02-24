package com.example.locc.domain.user.dto.response;

import com.example.locc.domain.user.entity.User;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 마이페이지 Response DTO
 */
@Getter
@Builder
public class UserMyPageResponse {

    private String email;
    private String name;
    private String gender;
    private String phoneNumber;
    private String address;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate birth;

    private String userType;
    private String approvalStatus;
    private String registrationPath;
    
    private Boolean emailVerified;
    private Boolean isOAuthUser;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * Entity -> Response 변환
     */
    public static UserMyPageResponse from(User user) {
        return UserMyPageResponse.builder()
                .email(user.getEmail())
                .name(user.getName())
                .gender(user.getGender())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .birth(user.getBirth())
                .userType(getUserTypeText(user.getUserType()))
                .approvalStatus(getApprovalStatusText(user.getApprovalStatus()))
                .registrationPath(user.getRegistrationPath())
                .emailVerified(user.getEmailVerified())
                .isOAuthUser(user.isOAuthUser())
                .createdAt(user.getCreatedAt())
                .build();
    }

    /**
     * 교인 구분 한글 변환
     */
    private static String getUserTypeText(User.UserType userType) {
        return switch (userType) {
            case REGISTERED -> "등록교인";
            case UNREGISTERED -> "미등록교인";
        };
    }

    /**
     * 승인 상태 한글 변환
     */
    private static String getApprovalStatusText(User.ApprovalStatus status) {
        return switch (status) {
            case PENDING -> "승인 대기";
            case APPROVED -> "승인 완료";
            case REJECTED -> "반려";
        };
    }
}
