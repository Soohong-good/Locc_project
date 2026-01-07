package com.example.locc.domain.user.dto.command;

import com.example.locc.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

/**
 * User 회원가입 Command
 */
@Getter
@Builder
public class UserRegisterCommand {

    private final String email;
    private final String password;  // 평문 (Service에서 암호화)
    private final String name;
    private final String gender;
    private final String phoneNumber;
    private final String address;
    private final LocalDate birth;
    private final String registrationPath;
    private final User.UserType userType;
}
