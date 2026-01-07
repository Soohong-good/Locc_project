package com.example.locc.domain.user.service;

import com.example.locc.domain.user.dto.response.UserDetailResponse;
import com.example.locc.domain.user.dto.response.UserResponse;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * User 조회 전용 서비스
 * - 읽기 전용 트랜잭션
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserQueryService {

    private final UserRepository userRepository;

    /**
     * 승인 대기 중인 회원 목록 조회
     */
    public Page<UserResponse> getPendingUsers(Pageable pageable) {
        log.debug("Finding pending users");
        return userRepository.findByApprovalStatus(User.ApprovalStatus.PENDING, pageable)
                .map(UserResponse::from);
    }

    /**
     * 전체 회원 목록 조회
     */
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        log.debug("Finding all users");
        return userRepository.findAll(pageable)
                .map(UserResponse::from);
    }

    /**
     * 회원 상세 조회
     */
    public UserDetailResponse getUserDetail(UUID id) {
        log.debug("Finding user detail: {}", id);
        User user = findById(id);
        return UserDetailResponse.from(user);
    }

    /**
     * 이메일로 사용자 조회
     */
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + email));
    }

    /**
     * 활성 사용자 조회 (삭제되지 않은)
     */
    public User findActiveByEmail(String email) {
        return userRepository.findActiveByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("활성 사용자를 찾을 수 없습니다: " + email));
    }

    /**
     * 승인 대기 중인 사용자 수 조회
     */
    public Long countPendingUsers() {
        return userRepository.countByApprovalStatus(User.ApprovalStatus.PENDING);
    }

    /**
     * ID로 사용자 조회 (내부용)
     */
    User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + id));
    }
}
