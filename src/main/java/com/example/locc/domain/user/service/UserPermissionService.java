package com.example.locc.domain.user.service;

import com.example.locc.domain.user.entity.AreaType;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.entity.UserAreaPermission;
import com.example.locc.domain.user.repository.UserAreaPermissionRepository;
import com.example.locc.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * 사용자 영역별 작성 권한 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserPermissionService {

    private final UserAreaPermissionRepository permissionRepository;
    private final UserRepository userRepository;

    /** 사용자의 권한 영역 목록 조회 */
    @Transactional(readOnly = true)
    public List<String> getUserPermissions(UUID userId) {
        return permissionRepository.findAreasByUserId(userId)
                .stream()
                .map(AreaType::name)
                .toList();
    }

    /** 이메일로 본인 권한 조회 */
    @Transactional(readOnly = true)
    public List<String> getMyPermissions(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return permissionRepository.findAreasByUserId(user.getId())
                .stream()
                .map(AreaType::name)
                .toList();
    }

    /** 권한 부여 (이미 있으면 무시) */
    @Transactional
    public void grantPermission(UUID userId, AreaType area, String adminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (permissionRepository.existsByUserAndArea(user, area)) {
            log.debug("이미 권한 존재: userId={}, area={}", userId, area);
            return;
        }

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("관리자를 찾을 수 없습니다."));

        permissionRepository.save(UserAreaPermission.grant(user, area, admin.getId()));
        log.info("권한 부여: userId={}, area={}, grantedBy={}", userId, area, admin.getId());
    }

    /** 권한 회수 */
    @Transactional
    public void revokePermission(UUID userId, AreaType area) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        permissionRepository.deleteByUserAndArea(user, area);
        log.info("권한 회수: userId={}, area={}", userId, area);
    }

    /** 특정 이메일 사용자가 해당 영역 권한 보유 여부 (관리자/운영자는 항상 true) */
    @Transactional(readOnly = true)
    public boolean hasPermission(String email, AreaType area) {
        return userRepository.findByEmail(email)
                .map(user -> user.isAdminOrOperator() || permissionRepository.existsByUserAndArea(user, area))
                .orElse(false);
    }
}
