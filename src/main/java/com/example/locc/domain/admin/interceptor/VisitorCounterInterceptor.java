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
 * - Phase 4에서 활성화
 * - WebConfig에 등록 필요
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class VisitorCounterInterceptor implements HandlerInterceptor {
    
    private final VisitorCounterService counterService;
    
    private static final List<String> EXCLUDE_PREFIXES = List.of(
        "/css/", "/js/", "/images/",
        "/admin/", "/api/admin/",
        "/actuator/", "/uploads/", "/webjars/"
    );
    
    private static final List<String> EXCLUDE_EXACT = List.of(
        "/favicon.ico", "/robots.txt", "/sitemap.xml"
    );
    
    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler) {
        
        String uri = request.getRequestURI();
        
        // Phase 4에서 활성화
        // 지금은 로그만 출력
        log.trace("방문자 카운팅 (Phase 4: 비활성화): {}", uri);
        
        // Phase 4에서 주석 해제:
        // if (shouldExclude(uri)) {
        //     return true;
        // }
        // 
        // try {
        //     counterService.incrementPageView();
        //     counterService.incrementVisit();
        // } catch (Exception e) {
        //     log.warn("방문자 카운트 실패 (무시됨): {}", e.getMessage());
        // }
        
        return true;
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
        
        return false;
    }
}
