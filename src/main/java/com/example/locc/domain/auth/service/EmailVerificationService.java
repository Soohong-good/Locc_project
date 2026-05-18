package com.example.locc.domain.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

/**
 * 이메일 인증 서비스
 * - 인증 코드 생성 및 발송 (비동기)
 * - Redis를 이용한 임시 저장 (5분)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final RedisTemplate<String, String> redisTemplate;
    private final AsyncEmailSender asyncEmailSender;

    private static final String EMAIL_VERIFY_PREFIX    = "email:verify:";
    private static final String EMAIL_RESEND_PREFIX    = "email:resend:";
    private static final String EMAIL_VERIFIED_PREFIX  = "email:verified:"; // 인증 완료 증거
    private static final int CODE_EXPIRATION_MINUTES   = 5;
    private static final int RESEND_COOLDOWN_SECONDS   = 60;
    private static final int VERIFIED_EXPIRATION_MINUTES = 10; // 인증 완료 후 가입 유효 시간

    /**
     * 인증 코드 생성 및 이메일 발송
     * 즉시 반환하고 이메일은 백그라운드에서 발송
     */
    public void sendVerificationCode(String email) {
        long startTime = System.currentTimeMillis();
        log.debug("[이메일 서비스] 시작");
        
        // 재발송 쿨다운 체크
        long checkStart = System.currentTimeMillis();
        if (isResendCooldown(email)) {
            throw new IllegalStateException("인증 코드는 1분에 한 번만 요청할 수 있습니다.");
        }
        log.info("[이메일 서비스] 쿨다운 체크 완료 ({}ms)", System.currentTimeMillis() - checkStart);

        // 6자리 인증 코드 생성
        long codeGenStart = System.currentTimeMillis();
        String code = generateVerificationCode();
        log.info("[이메일 서비스] 코드 생성 완료 ({}ms)", System.currentTimeMillis() - codeGenStart);

        // Redis에 저장 (5분 유효)
        long redisStart = System.currentTimeMillis();
        String key = EMAIL_VERIFY_PREFIX + email;
        redisTemplate.opsForValue().set(key, code, CODE_EXPIRATION_MINUTES, TimeUnit.MINUTES);
        log.info("[이메일 서비스] Redis 저장 완료 ({}ms)", System.currentTimeMillis() - redisStart);

        // 재발송 쿨다운 설정
        long cooldownStart = System.currentTimeMillis();
        String resendKey = EMAIL_RESEND_PREFIX + email;
        redisTemplate.opsForValue().set(resendKey, "1", RESEND_COOLDOWN_SECONDS, TimeUnit.SECONDS);
        log.info("[이메일 서비스] 쿨다운 설정 완료 ({}ms)", System.currentTimeMillis() - cooldownStart);

        // 비동기로 이메일 발송 (별도 서비스 호출)
        long asyncStart = System.currentTimeMillis();
        asyncEmailSender.sendVerificationEmail(email, code);
        log.info("[이메일 서비스] 비동기 발송 호출 완료 ({}ms)", System.currentTimeMillis() - asyncStart);

        long totalTime = System.currentTimeMillis() - startTime;
        log.debug("[이메일 서비스] 전체 완료 ({}ms)", totalTime);
    }

    /**
     * 인증 코드 검증
     * - 성공 시 코드 삭제 + 인증 완료 증거 키 저장 (10분)
     * - 인증 완료 증거는 register() 시점에 서버가 확인 후 소비
     */
    public boolean verifyCode(String email, String code) {
        String key = EMAIL_VERIFY_PREFIX + email;
        String storedCode = redisTemplate.opsForValue().get(key);

        if (storedCode == null) {
            log.warn("인증 코드 만료 또는 존재하지 않음");
            return false;
        }

        boolean isValid = storedCode.equals(code);

        if (isValid) {
            // 인증 코드 삭제
            redisTemplate.delete(key);
            // 인증 완료 증거 저장 (10분 — 가입 폼 작성 시간 고려)
            String verifiedKey = EMAIL_VERIFIED_PREFIX + email;
            redisTemplate.opsForValue().set(verifiedKey, "true", VERIFIED_EXPIRATION_MINUTES, TimeUnit.MINUTES);
            log.debug("이메일 인증 성공: 증거 키 저장");
        } else {
            log.warn("인증 코드 불일치");
        }

        return isValid;
    }

    /**
     * 이메일 인증 완료 여부 확인 후 증거 키 소비 (1회용)
     * - register() 에서 호출
     * - 존재하면 true 반환 + 즉시 삭제 (재사용 방지)
     * - 존재하지 않으면 false 반환
     */
    public boolean consumeVerification(String email) {
        String verifiedKey = EMAIL_VERIFIED_PREFIX + email;
        Boolean exists = redisTemplate.hasKey(verifiedKey);
        if (Boolean.TRUE.equals(exists)) {
            redisTemplate.delete(verifiedKey);
            log.debug("이메일 인증 증거 소비 완료");
            return true;
        }
        return false;
    }

    /**
     * 6자리 숫자 인증 코드 생성
     * SecureRandom 사용으로 예측 불가능한 코드 생성 (000000~999999 전체 범위)
     */
    private String generateVerificationCode() {
        SecureRandom random = new SecureRandom();
        int code = random.nextInt(1000000);
        return String.format("%06d", code);
    }

    /**
     * 재발송 쿨다운 체크
     */
    private boolean isResendCooldown(String email) {
        String resendKey = EMAIL_RESEND_PREFIX + email;
        return Boolean.TRUE.equals(redisTemplate.hasKey(resendKey));
    }

    /**
     * 남은 쿨다운 시간 조회 (초)
     */
    public long getRemainingCooldown(String email) {
        String resendKey = EMAIL_RESEND_PREFIX + email;
        Long expiration = redisTemplate.getExpire(resendKey, TimeUnit.SECONDS);
        return expiration != null && expiration > 0 ? expiration : 0;
    }
}
