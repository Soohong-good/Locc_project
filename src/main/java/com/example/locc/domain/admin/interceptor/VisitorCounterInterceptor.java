package com.example.locc.domain.admin.interceptor;

import com.example.locc.domain.admin.service.VisitorCounterService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.List;

/**
 * 방문자 카운터 Interceptor
 * - Phase 4 활성화
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class VisitorCounterInterceptor implements HandlerInterceptor {
    
    private final VisitorCounterService counterService;
    
    private static final List<String> EXCLUDE_PREFIXES = List.of(
        "/css/", "/js/", "/images/",
        "/api/",  // 모든 API 제외
        "/admin/", "/api/admin/",
        "/actuator/", "/uploads/", "/webjars/"
    );
    
    private static final List<String> EXCLUDE_EXACT = List.of(
        "/favicon.ico", "/robots.txt", "/sitemap.xml",
        "/title_icon.ico",  // 커스텀 파비콘
        "/admin"  // 관리자 대시보드 제외
    );
    
    private static final List<String> EXCLUDE_EXTENSIONS = List.of(
        ".css", ".js", ".ico", ".png", ".jpg", ".jpeg", 
        ".gif", ".svg", ".woff", ".woff2", ".ttf", ".eot",
        ".map", ".webp"
    );
    
    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler) {
        
        String uri = request.getRequestURI();
        
        // 제외 대상 체크
        if (shouldExclude(uri)) {
            return true;
        }
        
        // 방문자 고유 키 생성 (IP + User-Agent)
        String visitorKey = generateVisitorKey(request);
        
        // 중복 체크 후 카운트
        boolean counted = counterService.incrementVisitIfNew(visitorKey);
        
        if (counted) {
            log.info(">>> [신규 방문자] {} (키: {})", uri, visitorKey.substring(0, 8) + "...");
        } else {
            log.trace(">>> [중복 방문] {} (키: {})", uri, visitorKey.substring(0, 8) + "...");
        }
        
        return true;
    }
    
    /**
     * 방문자 고유 키 생성 (IP + User-Agent 해시)
     */
    private String generateVisitorKey(HttpServletRequest request) {
        String ip = getClientIP(request);
        String userAgent = request.getHeader("User-Agent");
        String raw = ip + "|" + (userAgent != null ? userAgent : "");
        
        // 간단한 해시 (실제로는 MD5나 SHA256 사용 가능)
        return String.valueOf(raw.hashCode());
    }
    
    /**
     * 클라이언트 IP 추출 (프록시 고려)
     */
    private String getClientIP(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
    
    private boolean shouldExclude(String uri) {
        // 정확히 일치
        if (EXCLUDE_EXACT.contains(uri)) {
            return true;
        }
        
        // prefix 체크
        for (String prefix : EXCLUDE_PREFIXES) {
            if (uri.startsWith(prefix)) {
                return true;
            }
        }
        
        // 확장자 체크
        for (String ext : EXCLUDE_EXTENSIONS) {
            if (uri.endsWith(ext)) {
                return true;
            }
        }
        
        return false;
    }
}
