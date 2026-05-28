package com.example.locc.exception;

import com.example.locc.common.ErrorCode;
import com.example.locc.domain.auth.service.AsyncEmailSender;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.io.PrintWriter;
import java.io.StringWriter;

/**
 * REST API 전용 예외 핸들러
 *
 * 처리 범위:
 *   - 검증 예외 (400)
 *   - 도메인 예외 (400, 403, 404)
 *   - 인증/보안 예외 (401, 403)
 *   - 서버 예외 (500)
 */
@Slf4j
@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
public class RestExceptionHandler {

    private final AsyncEmailSender asyncEmailSender;

    // ───── 400 검증 오류 ─────

    /**
     * @Valid, @Validated - @RequestBody 검증 실패
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(MethodArgumentNotValidException e) {
        log.warn("Validation failed: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.ofValidation(
                ErrorResponse.FieldError.of(e.getBindingResult())
        );
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * @ModelAttribute 검증 실패
     */
    @ExceptionHandler(BindException.class)
    public ResponseEntity<ErrorResponse> handleBindException(BindException e) {
        log.warn("Bind failed: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.ofValidation(
                ErrorResponse.FieldError.of(e.getBindingResult())
        );
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * 잘못된 입력값
     */
    @ExceptionHandler(InvalidInputException.class)
    public ResponseEntity<ErrorResponse> handleInvalidInput(InvalidInputException e) {
        log.warn("InvalidInputException: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(ErrorCode.INVALID_INPUT, e.getMessage());
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * IllegalArgumentException
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException e) {
        log.warn("IllegalArgumentException: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(ErrorCode.INVALID_REQUEST, e.getMessage());
        return ResponseEntity.badRequest().body(response);
    }

    // ───── 401 인증 오류 ─────

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUsernameNotFound(UsernameNotFoundException e) {
        log.warn("Authentication failed: username not found");
        ErrorResponse response = ErrorResponse.of(ErrorCode.INVALID_CREDENTIALS);
        return ResponseEntity.status(ErrorCode.INVALID_CREDENTIALS.getHttpStatus()).body(response);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException e) {
        log.warn("Bad credentials");
        ErrorResponse response = ErrorResponse.of(ErrorCode.INVALID_CREDENTIALS);
        return ResponseEntity.status(ErrorCode.INVALID_CREDENTIALS.getHttpStatus()).body(response);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(AuthenticationException e) {
        log.warn("AuthenticationException: {}", e.getClass().getSimpleName());
        ErrorResponse response = ErrorResponse.of(ErrorCode.AUTHENTICATION_FAILED);
        return ResponseEntity.status(ErrorCode.AUTHENTICATION_FAILED.getHttpStatus()).body(response);
    }

    @ExceptionHandler(TokenRefreshException.class)
    public ResponseEntity<ErrorResponse> handleTokenRefresh(TokenRefreshException e) {
        log.warn("TokenRefreshException: {}", e.getMessage()); // 로그엔 토큰 포함 메시지
        ErrorResponse response = ErrorResponse.of(ErrorCode.TOKEN_EXPIRED, e.getUserMessage()); // 응답엔 사용자 메시지만
        return ResponseEntity.status(ErrorCode.TOKEN_EXPIRED.getHttpStatus()).body(response);
    }

    // ───── 403 권한 오류 ─────

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException e) {
        log.warn("AccessDeniedException: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(ErrorCode.ACCESS_DENIED, e.getMessage());
        return ResponseEntity.status(ErrorCode.ACCESS_DENIED.getHttpStatus()).body(response);
    }

    @ExceptionHandler(AccountNotApprovedException.class)
    public ResponseEntity<ErrorResponse> handleAccountNotApproved(AccountNotApprovedException e) {
        log.warn("AccountNotApprovedException: status={}", e.getApprovalStatus());

        String message = switch (e.getApprovalStatus()) {
            case "PENDING"  -> "승인대기중인 계정입니다.";
            case "REJECTED" -> "회원가입이 반려되었습니다. 문의사항은 교회로 연락해주세요.";
            default         -> ErrorCode.ACCOUNT_NOT_APPROVED.getDefaultMessage();
        };

        ErrorResponse response = ErrorResponse.of(ErrorCode.ACCOUNT_NOT_APPROVED, message, e.getApprovalStatus());
        return ResponseEntity.status(ErrorCode.ACCOUNT_NOT_APPROVED.getHttpStatus()).body(response);
    }

    @ExceptionHandler(AccountDeletedException.class)
    public ResponseEntity<ErrorResponse> handleAccountDeleted(AccountDeletedException e) {
        log.warn("AccountDeletedException: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(ErrorCode.ACCOUNT_DELETED, e.getMessage());
        return ResponseEntity.status(ErrorCode.ACCOUNT_DELETED.getHttpStatus()).body(response);
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ErrorResponse> handleDisabled(DisabledException e) {
        log.warn("DisabledException: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(ErrorCode.ACCOUNT_DISABLED);
        return ResponseEntity.status(ErrorCode.ACCOUNT_DISABLED.getHttpStatus()).body(response);
    }

    // ───── 404 리소스 없음 ─────

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException e) {
        log.warn("NotFoundException: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(ErrorCode.NOT_FOUND, e.getMessage());
        return ResponseEntity.status(ErrorCode.NOT_FOUND.getHttpStatus()).body(response);
    }

    // ───── 413 파일 크기 초과 ─────

    /**
     * 파일 업로드 크기 초과
     * - Spring multipart max-file-size / max-request-size 초과
     * - Tomcat maxPostSize 초과 (파라미터 데이터 포함)
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException e) {
        log.warn("MaxUploadSizeExceededException: {}", e.getMessage());

        // 파일 단건 초과 vs 요청 전체 초과 구분
        String detail;
        String cause = e.getCause() != null ? e.getCause().getMessage() : "";
        if (cause.contains("maxPostSize") || cause.contains("parameter data")) {
            detail = "요청 데이터가 너무 큽니다. 이미지 파일은 한 번에 여러 장보다 한 장씩 업로드해주세요.";
        } else {
            long maxMb = e.getMaxUploadSize() / (1024 * 1024);
            detail = maxMb > 0
                    ? "파일 크기가 허용 한도(" + maxMb + "MB)를 초과했습니다. 파일 크기를 줄여서 다시 시도해주세요."
                    : "파일 크기가 허용 한도를 초과했습니다. 파일 크기를 줄여서 다시 시도해주세요.";
        }

        ErrorResponse response = ErrorResponse.of(ErrorCode.FILE_TOO_LARGE, detail);
        return ResponseEntity.status(ErrorCode.FILE_TOO_LARGE.getHttpStatus()).body(response);
    }

    // ───── 500 서버 오류 ─────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e, HttpServletRequest request) {
        log.error("Unexpected error - {}: {}", e.getClass().getName(), e.getMessage(), e);

        // 스택트레이스 문자열 변환
        StringWriter sw = new StringWriter();
        e.printStackTrace(new PrintWriter(sw));
        String stackTrace = sw.toString();
        if (stackTrace.length() > 3000) stackTrace = stackTrace.substring(0, 3000) + "\n... (truncated)";

        String detail = "URL: " + request.getMethod() + " " + request.getRequestURI() + "\n\n" + stackTrace;
        asyncEmailSender.sendErrorAlert("서버 에러 발생", e.getClass().getSimpleName(), e.getMessage(), detail);

        ErrorResponse response = ErrorResponse.of(ErrorCode.INTERNAL_SERVER_ERROR);
        return ResponseEntity.status(ErrorCode.INTERNAL_SERVER_ERROR.getHttpStatus()).body(response);
    }
}
