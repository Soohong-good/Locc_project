package com.example.locc.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoResponse {
    private UUID id;
    private String email;
    private String name;
    private String gender;
    private String phoneNumber;
    private String role;
    private String userType;
    
    // 미등록교인 추가 정보
    private String address;
    private LocalDate birth;
    private String registrationPath;
}