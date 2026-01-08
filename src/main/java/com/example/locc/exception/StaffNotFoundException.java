package com.example.locc.exception;

public class StaffNotFoundException extends RuntimeException {
    public StaffNotFoundException(Long id) {
        super("교역자/직원을 찾을 수 없습니다. ID: " + id);
    }
}
