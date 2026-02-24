package com.example.locc.domain.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EmailVerificationResponse {
    
    private boolean success;
    private String message;
    
    public static EmailVerificationResponse success(String message) {
        return new EmailVerificationResponse(true, message);
    }
    
    public static EmailVerificationResponse error(String message) {
        return new EmailVerificationResponse(false, message);
    }
}
