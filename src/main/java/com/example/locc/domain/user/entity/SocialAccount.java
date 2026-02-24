package com.example.locc.domain.user.entity;

import com.example.locc.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 소셜 로그인 연결 정보
 * User와 N:1 관계 (한 사용자가 여러 소셜 계정 연결 가능)
 */
@Entity
@Table(name = "social_accounts",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_provider_provider_id", 
                                columnNames = {"provider", "provider_id"})
        },
        indexes = {
                @Index(name = "idx_user_id", columnList = "user_id")
        })
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SocialAccount extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AuthProvider provider;

    @Column(name = "provider_id", nullable = false, length = 100)
    private String providerId;  // 카카오 id / 네이버 response.id

    @Column(length = 255)
    private String email;  // 소셜에서 받은 이메일 (없을 수도 있음)

    @Column(name = "display_name", length = 100)
    private String displayName;  // 소셜에서 받은 이름/닉네임

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_social_account_user"))
    private User user;

    /**
     * 소셜 계정 생성 (정적 팩토리 메서드)
     */
    public static SocialAccount link(AuthProvider provider, String providerId, 
                                    String email, String displayName, User user) {
        SocialAccount socialAccount = new SocialAccount();
        socialAccount.provider = provider;
        socialAccount.providerId = providerId;
        socialAccount.email = email;
        socialAccount.displayName = displayName;
        socialAccount.user = user;
        return socialAccount;
    }

    /**
     * 소셜 계정 정보 업데이트
     */
    public void updateInfo(String email, String displayName) {
        this.email = email;
        this.displayName = displayName;
    }
}
