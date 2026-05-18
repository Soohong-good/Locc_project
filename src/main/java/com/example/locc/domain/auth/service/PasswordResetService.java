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
     *
     * 계정 열거(Account Enumeration) 방지:
     *   - 이메일 존재 여부와 관계없이 동일한 200 응답 반환
     *   - 미존재 이메일이면 이메일만 발송하지 않고 조용히 종료
     *   - 공격자가 응답만으로 가입 여부를 확인할 수 없음
     */
    public void requestPasswordReset(String email) {
        log.debug("비밀번호 재설정 요청 수신");

        // 사용자 존재 확인 — 미존재 시 예외 없이 종료 (계정 열거 방지)
        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            log.debug("비밀번호 재설정 요청: 미등록 이메일 (정상 응답 반환)");
            return;
        }

        User user = userOpt.get();

        // 삭제된 계정은 조용히 종료 (계정 존재 여부 노출 방지)
        if (user.isDeleted()) {
            log.debug("비밀번호 재설정 요청: 삭제된 계정 (정상 응답 반환)");
            return;
        }

        // 재설정 토큰 생성
        String token = UUID.randomUUID().toString();

        // Redis에 저장 (30분 유효)
        String key = RESET_TOKEN_PREFIX + token;
        redisTemplate.opsForValue().set(key, email, TOKEN_EXPIRATION_MINUTES, TimeUnit.MINUTES);

        // 비동기로 이메일 발송
        asyncEmailSender.sendPasswordResetEmail(email, token, user.getName());

        log.debug("비밀번호 재설정 링크 발송 완료");
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

        log.debug("비밀번호 재설정 완료");
    }
}
