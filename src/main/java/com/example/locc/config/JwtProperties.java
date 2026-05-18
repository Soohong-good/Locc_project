package com.example.locc.config;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.Base64;

/**
 * JWT 관련 설정
 */
@Slf4j
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {

    /**
     * JWT 서명에 사용되는 비밀키
     * HS256 최소 요구: 32바이트(256비트)
     * 운영 권장: 64바이트(512비트) Base64 인코딩 값
     */
    private String secret;

    /**
     * Access Token 만료 시간 (밀리초)
     * 기본값: 5시간 (18000000ms)
     */
    private long expiration = 18000000L;

    /**
     * Refresh Token 만료 시간 (밀리초)
     * 기본값: 7일 (604800000ms)
     */
    private long refreshExpiration = 604800000L;

    /**
     * 애플리케이션 시작 시 JWT Secret 강도 검증
     * - 최소 32바이트(256비트) 미만이면 즉시 기동 중단
     * - 64바이트(512비트) 미만이면 경고 로그 출력
     */
    @PostConstruct
    public void validateSecret() {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                "[보안] JWT_SECRET이 설정되지 않았습니다. 애플리케이션을 시작할 수 없습니다."
            );
        }

        // 사람이 읽을 수 있는 패턴 감지 (공백, 소문자 영단어 연속, '-' 구분자 등)
        if (secret.matches(".*[a-z]{4,}.*-.*[a-z]{4,}.*") || secret.contains("church") || secret.contains("secret")) {
            throw new IllegalStateException(
                "[보안] JWT_SECRET에 예측 가능한 문자열이 포함되어 있습니다. " +
                "암호학적으로 안전한 랜덤 값을 사용하세요. " +
                "생성: node -e \"const crypto=require('crypto'); console.log(crypto.randomBytes(64).toString('base64'));\""
            );
        }

        // 실제 바이트 길이 계산 (Base64 디코딩 시도)
        int byteLength;
        try {
            byteLength = Base64.getDecoder().decode(secret).length;
        } catch (IllegalArgumentException e) {
            // Base64가 아닌 경우 UTF-8 바이트 길이로 측정
            byteLength = secret.getBytes(java.nio.charset.StandardCharsets.UTF_8).length;
        }

        if (byteLength < 32) {
            throw new IllegalStateException(
                String.format(
                    "[보안] JWT_SECRET이 너무 짧습니다. (현재: %d바이트, 최소: 32바이트) " +
                    "애플리케이션을 시작할 수 없습니다.", byteLength
                )
            );
        }

        if (byteLength < 64) {
            log.warn("[보안 경고] JWT_SECRET이 권장 길이보다 짧습니다. (현재: {}바이트, 권장: 64바이트 이상)", byteLength);
        } else {
            log.info("[보안] JWT_SECRET 검증 완료 ({}바이트)", byteLength);
        }
    }
}
