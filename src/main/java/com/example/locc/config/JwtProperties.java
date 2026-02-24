package com.example.locc.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * JWT 관련 설정
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    
    /**
     * JWT 서명에 사용되는 비밀키
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
}
