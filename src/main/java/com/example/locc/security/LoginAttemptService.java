package com.example.locc.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Locale;

/**
 * 계정 단위 인증 실패 횟수 제한 (비밀번호 로그인 · TOTP 공용)
 *
 * RateLimitFilter는 IP 기준이라 IP를 바꿔가며 한 계정을 계속 대입하는 공격을 막지 못한다.
 * 여기서는 계정(이메일) 기준으로 실패 횟수를 세어, 한도를 넘으면 창이 끝날 때까지 시도를 거부한다.
 *
 * 방식: Redis INCR + TTL — 첫 실패 시점부터 WINDOW 동안 MAX_FAILURES 회까지 허용, 성공 시 초기화
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LoginAttemptService {

    public static final String SCOPE_PASSWORD = "password";
    public static final String SCOPE_TOTP     = "totp";

    private static final int      MAX_FAILURES = 10;
    private static final Duration WINDOW       = Duration.ofMinutes(15);
    private static final String   KEY_PREFIX   = "auth_fail:";

    private final StringRedisTemplate stringRedisTemplate;

    /** 한도를 넘어 잠긴 상태인지 */
    public boolean isLocked(String scope, String email) {
        String value = stringRedisTemplate.opsForValue().get(key(scope, email));
        if (value == null) return false;
        try {
            return Long.parseLong(value) >= MAX_FAILURES;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    /** 실패 1회 기록 */
    public void recordFailure(String scope, String email) {
        String key = key(scope, email);
        Long count = stringRedisTemplate.opsForValue().increment(key);
        // 최초 생성 시에만 TTL 설정 (기존 TTL 덮어쓰기 방지)
        if (count != null && count == 1) {
            stringRedisTemplate.expire(key, WINDOW);
        }
        if (count != null && count == MAX_FAILURES) {
            log.warn("[인증 잠금] 실패 한도 도달 - scope={}", scope);
        }
    }

    /** 성공 시 실패 기록 초기화 */
    public void reset(String scope, String email) {
        stringRedisTemplate.delete(key(scope, email));
    }

    public long lockMinutes() {
        return WINDOW.toMinutes();
    }

    private String key(String scope, String email) {
        String normalized = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        return KEY_PREFIX + scope + ":" + normalized;
    }
}
