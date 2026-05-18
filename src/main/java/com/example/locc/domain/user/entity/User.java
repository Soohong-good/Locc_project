package com.example.locc.domain.user.entity;

import com.example.locc.domain.user.dto.command.UserRegisterCommand;
import com.example.locc.domain.user.dto.command.UserUpdateCommand;
import com.example.locc.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.ArrayList;
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

    @Email(message = "올바른 이메일 형식이 아닙니다")
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    @Builder.Default
    private Boolean emailVerified = false;

    // 소셜 전용 계정은 password = null 허용
    @Column(nullable = true)
    private String password;

    // 소셜 로그인 연결 (1:N 관계)
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SocialAccount> socialAccounts = new ArrayList<>();

    @Size(max = 50, message = "이름은 50자를 초과할 수 없습니다")
    @Column(nullable = false, length = 50)
    private String name;

    @Column(unique = true, length = 50)
    private String username;  // 로그인용 아이디 (소셜 로그인 시 필수)

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

    // 약관 동의
    @Builder.Default
    @Column(nullable = false)
    private Boolean agreedToTerms = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean agreedToPrivacy = false;


    // ===== Enum 정의 =====

    public enum Role {
        USER,
        OPERATOR,  // 운영자 (게시물 CRUD 가능, 관리자 패널 접근 불가)
        ADMIN      // 총관리자 (전체 권한)
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
                .username(command.getEmail()) // 기본값으로 이메일 사용
                .gender(command.getGender())
                .phoneNumber(command.getPhoneNumber())
                .address(command.getAddress())
                .birth(command.getBirth())
                .registrationPath(command.getRegistrationPath())
                .role(Role.USER)
                .userType(command.getUserType())
                .approvalStatus(ApprovalStatus.PENDING)
                .enabled(false)  // 승인 대기 상태
                .emailVerified(false)
                .agreedToTerms(command.getAgreedToTerms())
                .agreedToPrivacy(command.getAgreedToPrivacy())
                .build();
    }

    /**
     * OAuth2 소셜 로그인 임시 사용자 생성 (추가 정보 입력 필요)
     * - password = null (소셜 전용 계정은 비밀번호 없음)
     * - SocialAccount는 별도로 생성하여 연결
     */
    public static User createOAuthTemporaryUser(String email, String name) {
        return User.builder()
                .email(email)
                .password(null)  // 소셜 전용 계정은 비밀번호 없음
                .name(name != null && !name.isBlank() ? name : "소셜로그인사용자")
                .role(Role.USER)
                .userType(UserType.REGISTERED)
                .approvalStatus(ApprovalStatus.PENDING)  // 추가 정보 입력 필요
                .enabled(false)
                .emailVerified(true)  // 소셜 계정 이메일은 이미 인증됨
                .build();
    }

    /**
     * OAuth2 추가 정보로 회원가입 완료
     */
    public void completeOAuthRegistration(String name, String username, String phoneNumber, LocalDate birth, String gender,
                                          String address, String registrationPath,
                                          Boolean agreedToTerms, Boolean agreedToPrivacy) {
        if (name != null && !name.isBlank()) {
            this.name = name;
        }
        this.username = username;
        this.phoneNumber = phoneNumber;
        this.birth = birth;
        this.gender = gender;
        this.address = address;
        this.registrationPath = registrationPath;
        this.agreedToTerms = agreedToTerms;
        this.agreedToPrivacy = agreedToPrivacy;
        this.approvalStatus = ApprovalStatus.PENDING;  // 관리자 승인 대기
    }

    /**
     * 이메일 인증 완료
     */
    public void verifyEmail() {
        this.emailVerified = true;
    }

    /**
     * 소셜 로그인 전용 계정 여부
     * - SocialAccount가 연결되어 있고 password가 null인 경우
     * - 일반 계정에 소셜 연결이 추가된 경우는 false (비밀번호 있음)
     */
    public boolean isOAuthUser() {
        return socialAccounts != null && !socialAccounts.isEmpty() && this.password == null;
    }

    /**
     * 일반 계정에 소셜 계정 전환 연결
     * - 소셜 로그인 시 이메일이 기존 일반 계정과 일치할 때 호출
     * - 비밀번호는 유지 (로컬 로그인도 계속 가능)
     * - 이메일 인증 완료 처리
     */
    public void convertToSocialLinked() {
        this.emailVerified = true;
    }

    /**
     * 소셜 계정 연결 여부 (일반 계정에 소셜 연결된 경우 포함)
     */
    public boolean hasSocialAccount() {
        return socialAccounts != null && !socialAccounts.isEmpty();
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
     * 회원 차단 (비활성화)
     */
    public void disable() {
        this.enabled = false;
    }

    /**
     * 회원 차단 해제 (활성화)
     */
    public void enable() {
        this.enabled = true;
    }

    /**
     * 교인 구분 변경
     */
    public void changeUserType(UserType userType) {
        this.userType = userType;
    }

    /**
     * 관리자 여부 확인
     */
    public boolean isAdmin() {
        return this.role == Role.ADMIN;
    }

    public boolean isOperator() {
        return this.role == Role.OPERATOR;
    }

    public boolean isAdminOrOperator() {
        return this.role == Role.ADMIN || this.role == Role.OPERATOR;
    }

    /**
     * 운영자 권한 부여
     */
    public void grantOperator() {
        this.role = Role.OPERATOR;
    }

    /**
     * 운영자 권한 회수 (일반 회원으로 강등)
     */
    public void revokeOperator() {
        this.role = Role.USER;
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