package com.example.locc.domain.user.dto.response;

import com.example.locc.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * User 상세 응답 DTO
 */
@Getter
@Builder
public class UserDetailResponse {

    private final UUID id;
    private final String email;
    private final String name;
    private final String gender;
    private final String phoneNumber;
    private final String address;
    private final LocalDate birth;
    private final String registrationPath;
    private final User.Role role;
    private final User.UserType userType;
    private final User.ApprovalStatus approvalStatus;
    private final String rejectionReason;
    private final Boolean enabled;
    private final Boolean deleted;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    // 소셜 로그인 관련 — 마이페이지 UI 분기에 필요
    private final Boolean isOAuthUser;           // 소셜 전용 계정 여부 (password=null)
    private final List<String> connectedProviders; // 연결된 소셜 제공자 목록 (예: ["KAKAO", "NAVER"])

    /**
     * Entity → DTO 변환
     */
    public static UserDetailResponse from(User user) {
        List<String> providers = user.getSocialAccounts().stream()
                .map(sa -> sa.getProvider().name())
                .toList();

        return UserDetailResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .gender(user.getGender())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .birth(user.getBirth())
                .registrationPath(user.getRegistrationPath())
                .role(user.getRole())
                .userType(user.getUserType())
                .approvalStatus(user.getApprovalStatus())
                .rejectionReason(user.getRejectionReason())
                .enabled(user.getEnabled())
                .deleted(user.getDeleted())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .isOAuthUser(user.isOAuthUser())
                .connectedProviders(providers)
                .build();
    }
}
