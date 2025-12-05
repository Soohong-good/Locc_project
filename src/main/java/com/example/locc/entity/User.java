package com.example.locc.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_email", columnList = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity implements UserDetails {

    @Id
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

    @NotBlank(message = "성별은 필수입니다")
    @Column(nullable = false, length = 10)
    private String gender;

    @NotBlank(message = "전화번호는 필수입니다")
    @Column(nullable = false, length = 20)
    private String phoneNumber;

    // 미등록교인 추가 필드
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

    @Builder.Default
    @Column(nullable = false)
    private Boolean accountNonExpired = true;

    @Builder.Default
    @Column(nullable = false)
    private Boolean accountNonLocked = true;

    @Builder.Default
    @Column(nullable = false)
    private Boolean credentialsNonExpired = true;

    @Builder.Default
    @Column(nullable = false)
    private Boolean enabled = true;

    @Builder.Default
    @Column(nullable = false, name = "is_deleted")
    private Boolean isDeleted = false;

    // 생성 전에 UUID 자동 생성
    @PrePersist
    public void generateId() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
    }

    // UserDetails 구현
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
        return email; // 이메일을 username으로 사용
    }

    @Override
    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }

    @Override
    public boolean isEnabled() {
        return enabled && !isDeleted;
    }

    /**
     * 논리적 삭제 (Soft Delete)
     */
    public void delete() {
        this.isDeleted = true;
        this.enabled = false;
    }

    /**
     * 삭제 복구
     */
    public void restore() {
        this.isDeleted = false;
        this.enabled = true;
    }

    @Builder.Default
    @OneToMany(mappedBy = "createdBy", cascade = CascadeType.ALL)
    private List<Notice> notices = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "createdBy", cascade = CascadeType.ALL)
    private List<Sermon> sermons = new ArrayList<>();

    public enum Role {
        USER,
        ADMIN
    }

    public enum UserType {
        REGISTERED,   // 등록교인
        UNREGISTERED  // 미등록교인
    }
}