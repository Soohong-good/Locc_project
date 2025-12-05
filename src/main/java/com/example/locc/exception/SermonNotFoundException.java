package com.example.locc.exception;

public class SermonNotFoundException extends RuntimeException {
    public SermonNotFoundException(Long id) {
        super("설교를 찾을 수 없습니다. ID: " + id);
    }
}