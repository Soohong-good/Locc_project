package com.example.locc.domain.user.repository;

import com.example.locc.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

/**
 * User Repository
 */
public interface UserRepository extends JpaRepository<User, UUID> {

    /**
     * 이메일로 사용자 조회
     */
    Optional<User> findByEmail(String email);

    /**
     * 이메일 중복 체크
     */
    Boolean existsByEmail(String email);

    /**
     * 활성 사용자 조회 (삭제되지 않은)
     */
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.deleted = false")
    Optional<User> findActiveByEmail(@Param("email") String email);

    /**
     * 승인 상태별 사용자 조회
     */
    Page<User> findByApprovalStatus(User.ApprovalStatus approvalStatus, Pageable pageable);

    /**
     * 승인 대기 중인 사용자 수 조회
     */
    Long countByApprovalStatus(User.ApprovalStatus approvalStatus);
}
