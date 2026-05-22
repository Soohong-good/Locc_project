package com.example.locc.domain.admin.controller;

import com.example.locc.domain.admin.service.VisitorCounterService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Slf4j
@RestController
@RequestMapping("/api/visitor")
@RequiredArgsConstructor
public class VisitorApiController {

    private final VisitorCounterService counterService;

    @PostMapping("/count")
    public ResponseEntity<Void> count(HttpServletRequest request) {
        try {
            String ip = getClientIp(request);
            String userAgent = request.getHeader("User-Agent");
            String visitorKey = buildVisitorKey(ip, userAgent);
            counterService.incrementPageView();
            boolean counted = counterService.incrementVisitIfNew(visitorKey);
            if (counted) {
                log.info("[신규 방문자] IP: {}", ip);
            } else {
                log.trace("[중복 방문] IP: {}", ip);
            }
        } catch (Exception e) {
            log.warn("방문자 카운트 실패 (Redis 장애): {}", e.getMessage());
        }
        return ResponseEntity.ok().build();
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static String buildVisitorKey(String ip, String userAgent) {
        String raw = ip + "|" + (userAgent != null ? userAgent : "");
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 8; i++) {
                sb.append(String.format("%02x", hash[i]));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            return String.valueOf(raw.hashCode());
        }
    }
}
