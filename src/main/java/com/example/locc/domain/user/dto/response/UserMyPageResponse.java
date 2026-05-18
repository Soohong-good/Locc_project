package com.example.locc.domain.user.dto.response;

import com.example.locc.domain.user.entity.AuthProvider;
import com.example.locc.domain.user.entity.User;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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
    private Boolean isOAuthUser;           // 소셜 전용 계정 여부 (password=null)
    private List<String> connectedProviders; // 연결된 소셜 제공자 목록 (예: ["KAKAO", "NAVER"])

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * Entity -> Response 변환
     */
    public static UserMyPageResponse from(User user) {
        List<String> providers = user.getSocialAccounts().stream()
                .map(sa -> sa.getProvider().name())
                .toList();

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
                .connectedProviders(providers)
                .createdAt(user.getCreatedAt())
                .build();
    }

    private static String getUserTypeText(User.UserType userType) {
        return switch (userType) {
            case REGISTERED -> "등록교인";
            case UNREGISTERED -> "미등록교인";
        };
    }

    private static String getApprovalStatusText(User.ApprovalStatus status) {
        return switch (status) {
            case PENDING -> "승인 대기";
            case APPROVED -> "승인 완료";
            case REJECTED -> "반려";
        };
    }
}
