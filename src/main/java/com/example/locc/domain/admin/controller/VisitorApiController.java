package com.example.locc.domain.admin.controller;

import com.example.locc.domain.admin.service.VisitorCounterService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/visitor")
@RequiredArgsConstructor
public class VisitorApiController {

    private final VisitorCounterService counterService;

    @PostMapping("/count")
    public ResponseEntity<Void> count(HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        String visitorKey = String.valueOf((ip + "|" + (userAgent != null ? userAgent : "")).hashCode());
        boolean counted = counterService.incrementVisitIfNew(visitorKey);
        if (counted) {
            log.info("[신규 방문자] IP: {}", ip);
        } else {
            log.trace("[중복 방문] IP: {}", ip);
        }
        return ResponseEntity.ok().build();
    }
}
