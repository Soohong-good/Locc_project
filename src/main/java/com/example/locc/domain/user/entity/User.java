package com.example.locc.domain.user.entity;

import com.example.locc.domain.user.dto.command.UserRegisterCommand;
import com.example.locc.domain.user.dto.command.UserUpdateCommand;
import com.example.locc.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * User 도메인 엔티티
 * - Spring Security UserDetails 구현
 * - 회원가입, 승인, 인증 관리
 */
@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_email", columnList = "email")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(access = AccessLevel.PRIVATE)
public class User extends BaseEntity implements UserDetails {

    @Id
    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다")
    @Column(nullable = false)
    private String password;

    @NotBlank(message = "이름은 필수입니다")
    @Size(max = 50, message = "이름은 50자를 초과할 수 없습니다")
    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 10)
    private String gender;

    @Column(length = 20)
    private String phoneNumber;

    @Column(length = 200)
    private String address;

    @Column
    private LocalDate birth;

    @Size(max = 500, message = "등록 경로는 500자를 초과할 수 없습니다")
    @Column(length = 500)
    private String registrationPath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.USER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private UserType userType = UserType.REGISTERED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @Column(length = 500)
    private String rejectionReason;

    @Builder.Default
    @Column(nullable = false)
    private Boolean enabled = true;

    @Builder.Default
    @Column(nullable = false, name = "is_deleted")
    private Boolean deleted = false;

    // ===== Enum 정의 =====

    public enum Role {
        USER,
        ADMIN
    }

    public enum UserType {
        REGISTERED,   // 등록교인
        UNREGISTERED  // 미등록교인
    }

    public enum ApprovalStatus {
        PENDING,   // 승인 대기
        APPROVED,  // 승인 완료
        REJECTED   // 반려
    }

    // ===== 팩토리 메서드 =====

    /**
     * 회원가입 (승인 대기 상태로 생성)
     */
    public static User register(UserRegisterCommand command, String encodedPassword) {
        return User.builder()
                .email(command.getEmail())
                .password(encodedPassword)
                .name(command.getName())
                .gender(command.getGender())
                .phoneNumber(command.getPhoneNumber())
                .address(command.getAddress())
                .birth(command.getBirth())
                .registrationPath(command.getRegistrationPath())
                .role(Role.USER)
                .userType(command.getUserType())
                .approvalStatus(ApprovalStatus.PENDING)
                .enabled(false)  // 승인 대기 상태
                .build();
    }

    // ===== 비즈니스 메서드 =====

    /**
     * 회원 정보 수정
     */
    public void update(UserUpdateCommand command) {
        if (command.getName() != null) {
            this.name = command.getName();
        }
        if (command.getGender() != null) {
            this.gender = command.getGender();
        }
        if (command.getPhoneNumber() != null) {
            this.phoneNumber = command.getPhoneNumber();
        }
        if (command.getAddress() != null) {
            this.address = command.getAddress();
        }
        if (command.getBirth() != null) {
            this.birth = command.getBirth();
        }
    }

    /**
     * 비밀번호 변경
     */
    public void changePassword(String newEncodedPassword) {
        this.password = newEncodedPassword;
    }

    /**
     * 가입 승인
     */
    public void approve() {
        this.approvalStatus = ApprovalStatus.APPROVED;
        this.enabled = true;
        this.rejectionReason = null;
    }

    /**
     * 가입 반려
     */
    public void reject(String reason) {
        this.approvalStatus = ApprovalStatus.REJECTED;
        this.enabled = false;
        this.rejectionReason = reason;
    }

    /**
     * 논리적 삭제
     */
    public void delete() {
        this.deleted = true;
        this.enabled = false;
    }

    /**
     * 삭제 복구
     */
    public void restore() {
        this.deleted = false;
        this.enabled = true;
    }

    /**
     * 관리자 여부 확인
     */
    public boolean isAdmin() {
        return this.role == Role.ADMIN;
    }

    /**
     * 승인 완료 여부 확인
     */
    public boolean isApproved() {
        return this.approvalStatus == ApprovalStatus.APPROVED;
    }

    /**
     * 삭제 여부 확인
     */
    public boolean isDeleted() {
        return Boolean.TRUE.equals(this.deleted);
    }

    // ===== UserDetails 구현 =====

    @PrePersist
    public void generateId() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;  // 계정 만료 사용 안 함
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;  // 계정 잠금 사용 안 함
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;  // 비밀번호 만료 사용 안 함
    }

    @Override
    public boolean isEnabled() {
        // enabled=true AND deleted=false 여야 활성 계정
        return Boolean.TRUE.equals(enabled) && !Boolean.TRUE.equals(deleted);
    }
}