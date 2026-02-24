package com.example.locc.common;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * 에러 코드 정의
 *
 * 프론트엔드에서 error.code 값으로 분기 처리 가능
 * 예: "NOT_FOUND" -> 404 안내, "INVALID_CREDENTIALS" -> 로그인 실패 메시지
 */
@Getter
public enum ErrorCode {

    // 400 Bad Request
    INVALID_INPUT("INVALID_INPUT", "입력값이 올바르지 않습니다.", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST("INVALID_REQUEST", "잘못된 요청입니다.", HttpStatus.BAD_REQUEST),
    VALIDATION_FAILED("VALIDATION_FAILED", "입력값 검증에 실패했습니다.", HttpStatus.BAD_REQUEST),

    // 401 Unauthorized
    INVALID_CREDENTIALS("INVALID_CREDENTIALS", "이메일 또는 비밀번호가 올바르지 않습니다.", HttpStatus.UNAUTHORIZED),
    AUTHENTICATION_FAILED("AUTHENTICATION_FAILED", "인증에 실패했습니다.", HttpStatus.UNAUTHORIZED),
    USER_NOT_FOUND_AUTH("USER_NOT_FOUND", "사용자를 찾을 수 없습니다.", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED("TOKEN_EXPIRED", "토큰이 만료되었습니다.", HttpStatus.UNAUTHORIZED),

    // 403 Forbidden
    ACCESS_DENIED("ACCESS_DENIED", "접근 권한이 없습니다.", HttpStatus.FORBIDDEN),
    ACCOUNT_NOT_APPROVED("ACCOUNT_NOT_APPROVED", "승인 대기 중인 계정입니다.", HttpStatus.FORBIDDEN),
    ACCOUNT_DELETED("ACCOUNT_DELETED", "탈퇴한 계정입니다.", HttpStatus.FORBIDDEN),
    ACCOUNT_DISABLED("ACCOUNT_DISABLED", "비활성화된 계정입니다. 관리자에게 문의해주세요.", HttpStatus.FORBIDDEN),

    // 404 Not Found
    NOT_FOUND("NOT_FOUND", "요청한 리소스를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),

    // 500 Internal Server Error
    INTERNAL_SERVER_ERROR("INTERNAL_SERVER_ERROR", "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String defaultMessage;
    private final HttpStatus httpStatus;

    ErrorCode(String code, String defaultMessage, HttpStatus httpStatus) {
        this.code = code;
        this.defaultMessage = defaultMessage;
        this.httpStatus = httpStatus;
    }
}
