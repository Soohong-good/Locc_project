package com.example.locc.domain.user.service;

import com.example.locc.domain.user.dto.command.UserUpdateCommand;
import com.example.locc.domain.user.dto.response.UserDetailResponse;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 마이페이지 Service
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserMyPageService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 사용자 정보 조회 (API 상세 응답용)
     */
    public UserDetailResponse getUserInfo(String email) {
        User user = userRepository.findByEmailWithSocialAccounts(email)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
        return UserDetailResponse.from(user);
    }

    /**
     * 프로필 정보 수정
     */
    @Transactional
    public void updateProfile(String email, UserUpdateCommand command) {
        User user = findUserByEmail(email);
        user.update(command);
        log.debug("프로필 수정 완료");
    }

    /**
     * 비밀번호 변경
     */
    @Transactional
    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = findUserByEmail(email);

        // 소셜 전용 계정(password=null)은 비밀번호 변경 불가
        // 일반 계정에 소셜 연결이 추가된 경우는 변경 가능
        if (user.isOAuthUser()) {
            throw new IllegalStateException("소셜 로그인 전용 계정은 비밀번호를 변경할 수 없습니다. 마이페이지에서 비밀번호를 새로 설정할 수 있습니다.");
        }

        // 현재 비밀번호 확인
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        // 새 비밀번호로 변경
        String encodedNewPassword = passwordEncoder.encode(newPassword);
        user.changePassword(encodedNewPassword);
        log.debug("비밀번호 변경 완료");
    }

    /**
     * 이메일로 사용자 조회
     */
    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
    }
}
