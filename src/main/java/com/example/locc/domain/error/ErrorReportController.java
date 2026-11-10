package com.example.locc.domain.error;

import com.example.locc.domain.auth.service.AsyncEmailSender;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 프론트엔드 에러 수신 API
 * - ErrorBoundary (React 렌더링 에러)
 * - window.onerror (JS 런타임 에러)
 * - window.onunhandledrejection (미처리 Promise 에러)
 */
@Slf4j
@RestController
@RequestMapping("/api/error-report")
@RequiredArgsConstructor
public class ErrorReportController {

    private final AsyncEmailSender asyncEmailSender;

    @PostMapping
    public ResponseEntity<Void> report(
            @RequestBody ErrorReportRequest request,
            HttpServletRequest httpRequest
    ) {
        String ip = httpRequest.getRemoteAddr();
        // [SECURITY] 비로그인 공개 API — 길이 제한 + 개행 제거(로그 위조 방지) 후 사용
        String type    = clean(request.type(), 50);
        String url     = clean(request.url(), 300);
        String message = clean(request.message(), 500);
        String stack   = request.stack() != null ? truncate(request.stack(), 4000) : null;
        log.warn("[프론트 에러] type={} url={} ip={} message={}", type, url, ip, message);

        String detail = """
                URL     : %s
                IP      : %s
                User-Agent: %s

                Stack:
                %s
                """.formatted(
                url,
                ip,
                clean(httpRequest.getHeader("User-Agent"), 300),
                stack != null ? stack : "(없음)"
        );

        asyncEmailSender.sendErrorAlert(
                "프론트 에러 발생 (" + type + ")",
                type,
                message,
                detail
        );

        return ResponseEntity.ok().build();
    }

    private static String truncate(String value, int max) {
        return value.length() > max ? value.substring(0, max) + "…(생략)" : value;
    }

    /** 길이 제한 + 제어문자(개행 포함) 제거 — 한 줄짜리 필드용 */
    private static String clean(String value, int max) {
        if (value == null) return null;
        return truncate(value.replaceAll("\\p{Cntrl}", " "), max);
    }

    record ErrorReportRequest(
            String type,
            String message,
            String stack,
            String url
    ) {}
}
