package com.example.locc.domain.auth.service;

import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * 비밀번호 재설정 서비스
 * - 비밀번호 재설정 토큰 생성 및 검증
 * - 이메일로 재설정 링크 발송
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final PasswordEncoder passwordEncoder;
    private final AsyncEmailSender asyncEmailSender;

    private static final String RESET_TOKEN_PREFIX = "password:reset:";
    private static final int TOKEN_EXPIRATION_MINUTES = 30;

    /**
     * 비밀번호 재설정 요청
     * 이메일로 재설정 링크 발송
     */
    public void requestPasswordReset(String email) {
        log.info("비밀번호 재설정 요청: {}", email);

        // 사용자 존재 확인
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("등록되지 않은 이메일입니다."));

        // 삭제된 계정 체크
        if (user.isDeleted()) {
            throw new IllegalStateException("삭제된 계정입니다. 관리자에게 문의해주세요.");
        }

        // 재설정 토큰 생성
        String token = UUID.randomUUID().toString();

        // Redis에 저장 (30분 유효)
        String key = RESET_TOKEN_PREFIX + token;
        redisTemplate.opsForValue().set(key, email, TOKEN_EXPIRATION_MINUTES, TimeUnit.MINUTES);

        // 비동기로 이메일 발송
        asyncEmailSender.sendPasswordResetEmail(email, token, user.getName());

        log.info("비밀번호 재설정 링크 발송 완료: {}", email);
    }

    /**
     * 토큰 검증
     */
    public boolean validateToken(String token) {
        String key = RESET_TOKEN_PREFIX + token;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    /**
     * 비밀번호 재설정
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        log.info("비밀번호 재설정 시작");

        // 토큰 검증 및 이메일 조회
        String key = RESET_TOKEN_PREFIX + token;
        String email = redisTemplate.opsForValue().get(key);

        if (email == null) {
            throw new IllegalArgumentException("유효하지 않거나 만료된 토큰입니다.");
        }

        // 사용자 조회
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 비밀번호 암호화 및 변경
        String encodedPassword = passwordEncoder.encode(newPassword);
        user.changePassword(encodedPassword);

        // 토큰 삭제 (재사용 방지)
        redisTemplate.delete(key);

        log.info("비밀번호 재설정 완료: {}", email);
    }

    /**
     * 토큰으로 이메일 조회
     */
    public String getEmailByToken(String token) {
        String key = RESET_TOKEN_PREFIX + token;
        return redisTemplate.opsForValue().get(key);
    }
}
