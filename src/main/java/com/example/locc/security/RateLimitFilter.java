package com.example.locc.security;

import com.example.locc.common.ErrorCode;
import com.example.locc.exception.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * IP 기반 Rate Limiting 필터
 *
 * 적용 엔드포인트 (POST 전용) — 실제 정책은 아래 POLICIES 맵 참조
 *
 * 방식: Redis INCR + TTL (슬라이딩 윈도우 근사)
 *   - 최초 요청 시 카운터 생성 및 TTL 설정
 *   - TTL 기간 내 카운터가 한계치 초과 시 429 반환
 *
 * IP 추출:
 *   - X-Forwarded-For (리버스 프록시) → 없으면 RemoteAddr 사용
 *
 * 429 응답 형식: 기존 ErrorResponse 구조와 동일
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper        objectMapper;

    // ───── 정책 정의 ─────────────────────────────────────────────────────────

    private static final Map<String, RateLimitPolicy> POLICIES = Map.ofEntries(
        Map.entry("/api/auth/login",                   new RateLimitPolicy(10, Duration.ofMinutes(1))),
        Map.entry("/api/auth/register",                new RateLimitPolicy(10, Duration.ofMinutes(10))),
        Map.entry("/api/auth/refresh",                 new RateLimitPolicy(20, Duration.ofMinutes(1))),
        Map.entry("/api/auth/password/reset-request",  new RateLimitPolicy(5,  Duration.ofMinutes(10))),
        Map.entry("/api/auth/email/send-code",         new RateLimitPolicy(10, Duration.ofMinutes(10))),
        Map.entry("/api/auth/check-email",             new RateLimitPolicy(20, Duration.ofMinutes(1))),
        Map.entry("/api/social/complete-registration", new RateLimitPolicy(10, Duration.ofMinutes(10))),
        // 비로그인 공개 API — 개인정보(이름/전화/이메일) 수집 엔드포인트이므로 스팸 방지 적용
        Map.entry("/api/help-request",                 new RateLimitPolicy(10, Duration.ofMinutes(10))),
        // TOTP 2차 인증 — preAuthToken 유효시간(5분) 내 6자리 코드 무차별 대입 방지
        Map.entry("/api/auth/totp/verify",             new RateLimitPolicy(10, Duration.ofMinutes(5))),
        Map.entry("/api/auth/totp/enable",             new RateLimitPolicy(10, Duration.ofMinutes(5)))
    );

    // 동적 경로 패턴 기반 Rate Limit 정책
    // key: 정규식 패턴, value: 정책
    private static final Map<Pattern, RateLimitPolicy> PATTERN_POLICIES = Map.of(
        Pattern.compile("^/api/notices/\\d+/views$"), new RateLimitPolicy(20, Duration.ofMinutes(1))
    );

    // ───── 필터 처리 ─────────────────────────────────────────────────────────

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // POST 메서드가 아닌 경우 제외
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String path = request.getRequestURI();
        // 정확 일치 정책 확인
        if (POLICIES.containsKey(path)) {
            return false;
        }
        // 패턴 일치 정책 확인
        for (Pattern pattern : PATTERN_POLICIES.keySet()) {
            if (pattern.matcher(path).matches()) {
                return false;
            }
        }
        return true;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path   = request.getRequestURI();
        String ip     = extractClientIp(request);

        // 정확 일치 정책 우선 조회, 없으면 패턴 정책 조회
        RateLimitPolicy policy = POLICIES.get(path);
        if (policy == null) {
            for (Map.Entry<Pattern, RateLimitPolicy> entry : PATTERN_POLICIES.entrySet()) {
                if (entry.getKey().matcher(path).matches()) {
                    policy = entry.getValue();
                    break;
                }
            }
        }

        String redisKey = "rate_limit:" + path + ":" + ip;

        long count = increment(redisKey, policy.windowDuration());

        if (count > policy.maxRequests()) {
            log.warn("[RateLimit] 차단 - ip={}, path={}, count={}", ip, path, count);
            sendTooManyRequestsResponse(response, policy.windowDuration().getSeconds());
            return;
        }

        filterChain.doFilter(request, response);
    }

    // ───── private ───────────────────────────────────────────────────────────

    /**
     * Redis INCR 후 최초 요청 시 TTL 설정
     * INCR 자체는 atomic — 동시성 이슈 없음
     */
    private long increment(String key, Duration windowDuration) {
        Long count = stringRedisTemplate.opsForValue().increment(key);
        if (count == null) count = 1L;

        // 최초 생성 시에만 TTL 설정 (기존 TTL 덮어쓰기 방지)
        if (count == 1) {
            stringRedisTemplate.expire(key, windowDuration);
        }
        return count;
    }

    /**
     * 클라이언트 IP 추출
     *
     * 구조: 실제 클라이언트 → Cloudflare → Nginx(Docker) → Spring Boot
     * getRemoteAddr()는 Nginx 컨테이너 IP(172.18.x.x)를 반환하므로 사용 불가.
     *
     * 우선순위:
     *   1. CF-Connecting-IP  — Cloudflare가 직접 설정, 클라이언트 스푸핑 불가
     *   2. X-Forwarded-For   — Cloudflare가 추가한 첫 번째 값 (실제 클라이언트 IP)
     *   3. X-Real-IP         — Nginx가 설정한 값 (fallback)
     *   4. getRemoteAddr()   — 최후 수단
     */
    private String extractClientIp(HttpServletRequest request) {
        String cfIp = request.getHeader("CF-Connecting-IP");
        if (cfIp != null && !cfIp.isBlank()) {
            return cfIp.trim();
        }
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * 429 Too Many Requests 응답 반환
     * 기존 ErrorResponse 구조 사용
     */
    private void sendTooManyRequestsResponse(HttpServletResponse response,
                                             long retryAfterSeconds) throws IOException {
        ErrorCode errorCode = ErrorCode.RATE_LIMIT_EXCEEDED;

        response.setStatus(errorCode.getHttpStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));

        ErrorResponse body = ErrorResponse.of(errorCode);
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }

    // ───── 정책 레코드 ────────────────────────────────────────────────────────

    private record RateLimitPolicy(int maxRequests, Duration windowDuration) {}
}
