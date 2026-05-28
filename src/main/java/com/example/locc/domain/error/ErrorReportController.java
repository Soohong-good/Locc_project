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
        log.warn("[프론트 에러] type={} url={} ip={} message={}",
                request.type(), request.url(), ip, request.message());

        String detail = """
                URL     : %s
                IP      : %s
                User-Agent: %s

                Stack:
                %s
                """.formatted(
                request.url(),
                ip,
                httpRequest.getHeader("User-Agent"),
                request.stack() != null ? request.stack() : "(없음)"
        );

        asyncEmailSender.sendErrorAlert(
                "프론트 에러 발생 (" + request.type() + ")",
                request.type(),
                request.message(),
                detail
        );

        return ResponseEntity.ok().build();
    }

    record ErrorReportRequest(
            String type,
            String message,
            String stack,
            String url
    ) {}
}
