package com.example.locc.service;

import com.example.locc.entity.User;
import com.example.locc.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * 승인 대기 중인 회원 목록 조회
     */
    public Page<User> getPendingUsers(Pageable pageable) {
        return userRepository.findByApprovalStatus(User.ApprovalStatus.PENDING, pageable);
    }

    /**
     * 모든 회원 목록 조회
     */
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    /**
     * 회원 상세 조회
     */
    public User getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    /**
     * 회원가입 승인
     */
    @Transactional
    public void approveUser(UUID userId) {
        User user = getUserById(userId);
        
        if (user.getApprovalStatus() != User.ApprovalStatus.PENDING) {
            throw new IllegalStateException("승인 대기 상태가 아닙니다.");
        }
        
        user.approve();
        log.info("User approved: {}", user.getEmail());
    }

    /**
     * 회원가입 반려
     */
    @Transactional
    public void rejectUser(UUID userId, String reason) {
        User user = getUserById(userId);
        
        if (user.getApprovalStatus() != User.ApprovalStatus.PENDING) {
            throw new IllegalStateException("승인 대기 상태가 아닙니다.");
        }
        
        user.reject(reason);
        log.info("User rejected: {} - Reason: {}", user.getEmail(), reason);
    }

    /**
     * 회원 삭제 (논리적 삭제)
     */
    @Transactional
    public void deleteUser(UUID userId) {
        User user = getUserById(userId);
        user.delete();
        log.info("User deleted: {}", user.getEmail());
    }

    /**
     * 회원 복구
     */
    @Transactional
    public void restoreUser(UUID userId) {
        User user = getUserById(userId);
        user.restore();
        log.info("User restored: {}", user.getEmail());
    }
}
