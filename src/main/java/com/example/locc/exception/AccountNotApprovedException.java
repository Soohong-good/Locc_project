package com.example.locc.exception;

import org.springframework.security.core.AuthenticationException;

public class AccountNotApprovedException extends AuthenticationException {
    
    private final String approvalStatus;
    
    public AccountNotApprovedException(String msg, String approvalStatus) {
        super(msg);
        this.approvalStatus = approvalStatus;
    }
    
    public String getApprovalStatus() {
        return approvalStatus;
    }
}
