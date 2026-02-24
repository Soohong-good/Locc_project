package com.example.locc.domain.admin.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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
    
    /**
     * 방문 증가 (중복 체크)
     * @param visitorKey 방문자 고유 키 (IP + User-Agent 해시)
     * @return true: 카운트 증가됨, false: 이미 방문함
     */
    public boolean incrementVisitIfNew(String visitorKey) {
        String today = LocalDate.now().format(DATE_FORMATTER);
        String checkKey = VISITOR_CHECK_PREFIX + today + ":" + visitorKey;
        
        // 이미 방문한 적이 있는지 체크
        Boolean isNew = redisTemplate.opsForValue().setIfAbsent(checkKey, "1", 24, TimeUnit.HOURS);
        
        if (Boolean.TRUE.equals(isNew)) {
            // 신규 방문자 → 카운트 증가
            String visitKey = VISIT_KEY_PREFIX + today;
            redisTemplate.opsForValue().increment(visitKey);
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
        String key = PAGE_VIEW_KEY_PREFIX + LocalDate.now().format(DATE_FORMATTER);
        redisTemplate.opsForValue().increment(key);
        log.trace("페이지뷰 증가: {}", key);
    }
    
    /**
     * 방문 증가 (레거시, 사용 안 함)
     */
    @Deprecated
    public void incrementVisit() {
        String key = VISIT_KEY_PREFIX + LocalDate.now().format(DATE_FORMATTER);
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
        return getPageViewCount(LocalDate.now());
    }
    
    /**
     * 오늘 방문 조회
     */
    public Long getTodayVisitCount() {
        return getVisitCount(LocalDate.now());
    }
}
