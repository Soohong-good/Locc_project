package com.example.locc.security;

import com.example.locc.config.JwtProperties;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long jwtExpiration;
    private final long refreshExpiration;

    public JwtTokenProvider(JwtProperties jwtProperties) {
        this.secretKey = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
        this.jwtExpiration = jwtProperties.getExpiration();
        this.refreshExpiration = jwtProperties.getRefreshExpiration();
    }

    /**
     * OAuth2 임시 토큰 생성 (추가 정보 입력용)
     * 10분 유효, type=oauth_temp
     */
    public String generateOAuthTempToken(String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "oauth_temp");
        
        long tempExpiration = 1000L * 60 * 10; // 10분
        return createToken(claims, email, tempExpiration);
    }

    /**
     * Access Token 생성
     */
    public String generateAccessToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "access");
        // Role 정보 추가
        claims.put("authorities", userDetails.getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .toList());
        return createToken(claims, userDetails.getUsername(), jwtExpiration);
    }

    /**
     * Refresh Token 생성
     */
    public String generateRefreshToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "refresh");
        return createToken(claims, userDetails.getUsername(), refreshExpiration);
    }

    /**
     * 토큰 생성 핵심 로직
     */
    private String createToken(Map<String, Object> claims, String subject, long expiration) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * 토큰에서 사용자명 추출
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * OAuth2 임시 토큰에서 이메일 추출 (type 검증 포함)
     * OAuth2 추가 정보 입력 전용
     */
    public String getEmailFromOAuthTemp(String token) {
        String raw = token == null ? "" : token.trim();
        if (raw.startsWith("Bearer ")) {
            raw = raw.substring(7);
        }

        Claims claims = extractAllClaims(raw);

        String type = (String) claims.get("type");
        if (!"oauth_temp".equals(type)) {
            throw new IllegalStateException("OAuth2 임시 토큰이 아닙니다.");
        }

        return claims.getSubject(); // email
    }

    /**
     * 토큰에서 만료일 추출
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * 토큰에서 특정 claim 추출
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * 토큰에서 모든 claim 추출
     */
    public Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException e) {
            log.error("JWT parsing error: {}", e.getMessage());
            throw e;
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * 토큰 만료 여부 확인
     */
    public Boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        }
    }

}