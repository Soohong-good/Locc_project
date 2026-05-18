package com.example.locc.exception;

import com.example.locc.common.ErrorCode;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * API 공통 에러 응답
 *
 * {
 *   "success": false,
 *   "code": "NOT_FOUND",
 *   "message": "공지사항을 찾을 수 없습니다.",
 *   "errors": [...],   // 검증 오류 시에만 포함
 *   "timestamp": "..."
 * }
 */
@Getter
public class ErrorResponse {

    private final boolean success = false;
    private final String code;
    private final String message;
    private final String approvalStatus; // 계정 승인 상태 (PENDING | REJECTED | null)
    private final List<FieldError> errors;
    private final LocalDateTime timestamp;

    private ErrorResponse(String code, String message, String approvalStatus, List<FieldError> errors) {
        this.code = code;
        this.message = message;
        this.approvalStatus = approvalStatus;
        this.errors = errors;
        this.timestamp = LocalDateTime.now();
    }

    // ErrorCode 기반 생성
    public static ErrorResponse of(ErrorCode errorCode) {
        return new ErrorResponse(errorCode.getCode(), errorCode.getDefaultMessage(), null, null);
    }

    // ErrorCode + 커스텀 메시지
    public static ErrorResponse of(ErrorCode errorCode, String message) {
        return new ErrorResponse(errorCode.getCode(), message, null, null);
    }

    // ErrorCode + 커스텀 메시지 + approvalStatus
    public static ErrorResponse of(ErrorCode errorCode, String message, String approvalStatus) {
        return new ErrorResponse(errorCode.getCode(), message, approvalStatus, null);
    }

    // 검증 오류 (BindingResult)
    public static ErrorResponse ofValidation(List<FieldError> fieldErrors) {
        return new ErrorResponse(
                ErrorCode.VALIDATION_FAILED.getCode(),
                ErrorCode.VALIDATION_FAILED.getDefaultMessage(),
                null,
                fieldErrors
        );
    }

    /**
     * 필드 검증 오류 항목
     */
    @Getter
    public static class FieldError {
        private final String field;
        private final String value;
        private final String reason;

        private FieldError(String field, String value, String reason) {
            this.field = field;
            this.value = value;
            this.reason = reason;
        }

        public static FieldError of(String field, String value, String reason) {
            return new FieldError(field, value, reason);
        }

        public static List<FieldError> of(
                org.springframework.validation.BindingResult bindingResult) {
            return bindingResult.getFieldErrors().stream()
                    .map(error -> FieldError.of(
                            error.getField(),
                            error.getRejectedValue() == null ? "" : error.getRejectedValue().toString(),
                            error.getDefaultMessage()
                    ))
                    .toList();
        }
    }
}
