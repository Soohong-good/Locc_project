package com.example.locc.domain.admin.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.TimeUnit;

/**
 * 방문자 카운터 서비스
 * - Phase 4 구현 완료
 * - Redis 기반 실시간 카운팅
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VisitorCounterService {
    
    private final StringRedisTemplate redisTemplate;
    
    private static final String VISIT_KEY_PREFIX = "visitor:visit:";
    private static final String PAGE_VIEW_KEY_PREFIX = "visitor:pageview:";
    private static final String VISITOR_CHECK_PREFIX = "visitor:check:";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    
    /**
     * 방문 증가 (중복 체크)
     * @param visitorKey 방문자 고유 키 (IP + User-Agent 해시)
     * @return true: 카운트 증가됨, false: 이미 방문함
     */
    public boolean incrementVisitIfNew(String visitorKey) {
        String today = LocalDate.now(KST).format(DATE_FORMATTER);
        String checkKey = VISITOR_CHECK_PREFIX + today + ":" + visitorKey;

        // check key TTL: 자정까지 남은 시간 계산 (당일 자정 리셋)
        java.time.ZonedDateTime now = java.time.ZonedDateTime.now(KST);
        java.time.ZonedDateTime nextMidnight = now.toLocalDate().plusDays(1).atStartOfDay(KST);
        long secondsUntilMidnight = java.time.Duration.between(now, nextMidnight).getSeconds();

        Boolean isNew = redisTemplate.opsForValue().setIfAbsent(checkKey, "1", secondsUntilMidnight, TimeUnit.SECONDS);

        if (Boolean.TRUE.equals(isNew)) {
            String visitKey = VISIT_KEY_PREFIX + today;
            Long count = redisTemplate.opsForValue().increment(visitKey);
            // visit key에 48h TTL 설정 (최초 increment 시 한 번만)
            if (Long.valueOf(1L).equals(count)) {
                redisTemplate.expire(visitKey, 48, TimeUnit.HOURS);
            }
            log.debug("신규 방문자 카운트 증가: {}", visitorKey);
            return true;
        }

        log.trace("이미 방문한 사용자: {}", visitorKey);
        return false;
    }
    
    /**
     * 페이지뷰 증가
     */
    public void incrementPageView() {
        String key = PAGE_VIEW_KEY_PREFIX + LocalDate.now(KST).format(DATE_FORMATTER);
        redisTemplate.opsForValue().increment(key);
        log.trace("페이지뷰 증가: {}", key);
    }
    
    /**
     * 방문 증가 (레거시, 사용 안 함)
     */
    @Deprecated
    public void incrementVisit() {
        String key = VISIT_KEY_PREFIX + LocalDate.now(KST).format(DATE_FORMATTER);
        redisTemplate.opsForValue().increment(key);
        log.trace("방문 증가: {}", key);
    }
    
    /**
     * 특정 날짜의 페이지뷰 카운트 조회
     */
    public Long getPageViewCount(LocalDate date) {
        String key = PAGE_VIEW_KEY_PREFIX + date.format(DATE_FORMATTER);
        String value = redisTemplate.opsForValue().get(key);
        return value != null ? Long.parseLong(value) : 0L;
    }
    
    /**
     * 특정 날짜의 방문 카운트 조회
     */
    public Long getVisitCount(LocalDate date) {
        String key = VISIT_KEY_PREFIX + date.format(DATE_FORMATTER);
        String value = redisTemplate.opsForValue().get(key);
        return value != null ? Long.parseLong(value) : 0L;
    }
    
    /**
     * 오늘 페이지뷰 조회
     */
    public Long getTodayPageViewCount() {
        return getPageViewCount(LocalDate.now(KST));
    }

    /**
     * 오늘 방문 조회
     */
    public Long getTodayVisitCount() {
        return getVisitCount(LocalDate.now(KST));
    }
}
