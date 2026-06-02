package com.example.locc.domain.user.service;

import com.example.locc.domain.user.dto.response.UserDetailResponse;
import com.example.locc.domain.user.dto.response.UserResponse;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.exception.InvalidInputException;
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
        return userRepository.findByApprovalStatusAndDeletedFalse(User.ApprovalStatus.PENDING, pageable)
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
     * 회원 상세 조회 (관리자용)
     * - socialAccounts fetch join으로 N+1 방지
     */
    public UserDetailResponse getUserDetail(UUID id) {
        log.debug("Finding user detail: {}", id);
        User user = userRepository.findByIdWithSocialAccounts(id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + id));
        return UserDetailResponse.from(user);
    }

    /**
     * 이메일로 사용자 조회
     */
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    /**
     * 이메일로 사용자 조회 + socialAccounts fetch
     * — UserDetailResponse.from() 호출 전 반드시 이 메서드 사용
     */
    public User findByEmailWithSocialAccounts(String email) {
        return userRepository.findByEmailWithSocialAccounts(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    /**
     * 활성 사용자 조회 (삭제되지 않은)
     */
    public User findActiveByEmail(String email) {
        return userRepository.findActiveByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("활성 사용자를 찾을 수 없습니다."));
    }

    /**
     * 승인 대기 중인 사용자 수 조회
     */
    public Long countPendingUsers() {
        return userRepository.countByApprovalStatusAndDeletedFalse(User.ApprovalStatus.PENDING);
    }

    /**
     * 승인 완료된 사용자 수 조회 (Admin용)
     */
    public Long countApprovedUsers() {
        return userRepository.countByApprovalStatusAndDeletedFalse(User.ApprovalStatus.APPROVED);
    }

    /**
     * 반려된 사용자 수 조회 (Admin용)
     */
    public Long countRejectedUsers() {
        return userRepository.countByApprovalStatusAndDeletedFalse(User.ApprovalStatus.REJECTED);
    }

    /**
     * 전체 사용자 수 조회 (Admin용)
     */
    public Long countAllUsers() {
        return userRepository.count();
    }

    /**
     * ID로 사용자 조회 (내부용)
     */
    User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + id));
    }

    /**
     * 이메일 사용 가능 여부 검증
     *
     * 중복 시 InvalidInputException 발생
     * — boolean을 직접 반환하지 않아 계정 열거(Account Enumeration) 위험을 낮춤
     * — Controller에서 "true면 가능, false면 불가"로 분기하는 패턴을 방지
     */
    public void validateEmailAvailable(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new InvalidInputException("이미 사용 중인 이메일입니다.");
        }
    }
}
