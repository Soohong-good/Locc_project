package com.example.locc.domain.user.repository;

import com.example.locc.domain.user.entity.AuthProvider;
import com.example.locc.domain.user.entity.SocialAccount;
import com.example.locc.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * 소셜 계정 Repository
 */
public interface SocialAccountRepository extends JpaRepository<SocialAccount, Long> {

    /**
     * 소셜 제공자와 제공자 ID로 소셜 계정 조회
     */
    Optional<SocialAccount> findByProviderAndProviderId(AuthProvider provider, String providerId);

    /**
     * 사용자의 모든 소셜 계정 조회
     */
    List<SocialAccount> findByUser(User user);

    /**
     * 사용자의 특정 제공자 소셜 계정 조회
     */
    Optional<SocialAccount> findByUserAndProvider(User user, AuthProvider provider);

    /**
     * 소셜 계정 존재 여부 확인
     */
    boolean existsByProviderAndProviderId(AuthProvider provider, String providerId);
}
