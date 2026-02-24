package com.example.locc.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

/**
 * API 공통 성공 응답 래퍼
 *
 * 사용 예시:
 *   return ResponseEntity.ok(ApiResponse.ok(data));
 *   return ResponseEntity.status(201).body(ApiResponse.created(data));
 *   return ResponseEntity.ok(ApiResponse.ok());  // 데이터 없는 성공
 */
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final String message;

    private ApiResponse(boolean success, T data, String message) {
        this.success = success;
        this.data = data;
        this.message = message;
    }

    // ───── 성공 응답 ─────

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, null);
    }

    public static <T> ApiResponse<T> ok() {
        return new ApiResponse<>(true, null, null);
    }

    public static <T> ApiResponse<T> ok(T data, String message) {
        return new ApiResponse<>(true, data, message);
    }

    public static <T> ApiResponse<T> created(T data) {
        return new ApiResponse<>(true, data, null);
    }
}
