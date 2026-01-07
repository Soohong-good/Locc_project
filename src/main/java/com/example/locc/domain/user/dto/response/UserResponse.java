package com.example.locc.domain.user.dto.response;

import com.example.locc.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * User 응답 DTO (목록용)
 */
@Getter
@Builder
public class UserResponse {

    private final UUID id;
    private final String email;
    private final String name;
    private final String gender;
    private final String phoneNumber;
    private final User.Role role;
    private final User.UserType userType;
    private final User.ApprovalStatus approvalStatus;
    private final Boolean enabled;
    private final Boolean deleted;
    private final LocalDateTime createdAt;

    /**
     * Entity → DTO 변환
     */
    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .gender(user.getGender())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .userType(user.getUserType())
                .approvalStatus(user.getApprovalStatus())
                .enabled(user.getEnabled())
                .deleted(user.getDeleted())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
