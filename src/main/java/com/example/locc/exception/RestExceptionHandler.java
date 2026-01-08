package com.example.locc.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RestExceptionHandler {

    // 404 - 리소스를 찾을 수 없음
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFoundException(NotFoundException e) {
        log.warn("NotFoundException: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(e.getMessage(), HttpStatus.NOT_FOUND.value());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    // 403 - 권한 없음
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException e) {
        log.warn("AccessDeniedException: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(e.getMessage(), HttpStatus.FORBIDDEN.value());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    // 400 - 잘못된 입력
    @ExceptionHandler(InvalidInputException.class)
    public ResponseEntity<ErrorResponse> handleInvalidInputException(InvalidInputException e) {
        log.warn("InvalidInputException: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(e.getMessage(), HttpStatus.BAD_REQUEST.value());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(AccountNotApprovedException.class)
    public ResponseEntity<Map<String, Object>> handleAccountNotApprovedException(AccountNotApprovedException e) {
        log.warn("Account not approved: {}", e.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("error", "ACCOUNT_NOT_APPROVED");
        response.put("message", e.getMessage());
        response.put("approvalStatus", e.getApprovalStatus());
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(AccountDeletedException.class)
    public ResponseEntity<Map<String, Object>> handleAccountDeletedException(AccountDeletedException e) {
        log.warn("Account deleted: {}", e.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("error", "ACCOUNT_DELETED");
        response.put("message", e.getMessage());
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentialsException(BadCredentialsException e) {
        log.warn("Bad credentials exception caught");
        
        Map<String, Object> response = new HashMap<>();
        response.put("error", "INVALID_CREDENTIALS");
        response.put("message", "이메일 또는 비밀번호가 올바르지 않습니다.");
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUsernameNotFoundException(UsernameNotFoundException e) {
        log.warn("Username not found: {}", e.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("error", "USER_NOT_FOUND");
        response.put("message", e.getMessage());
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<Map<String, Object>> handleDisabledException(DisabledException e) {
        log.warn("Account disabled: {}", e.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("error", "ACCOUNT_DISABLED");
        response.put("message", "비활성화된 계정입니다. 관리자에게 문의해주세요.");
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(AuthenticationException e) {
        log.warn("Authentication exception: {}", e.getClass().getSimpleName());
        
        Map<String, Object> response = new HashMap<>();
        response.put("error", "AUTHENTICATION_FAILED");
        response.put("message", "인증에 실패했습니다.");
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException e) {
        log.warn("Illegal argument: {}", e.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("error", "INVALID_REQUEST");
        response.put("message", e.getMessage());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception e) {
        log.error("Unexpected error - Class: {}, Message: {}", e.getClass().getName(), e.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("error", "INTERNAL_SERVER_ERROR");
        response.put("message", "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
