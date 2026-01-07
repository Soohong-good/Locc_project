package com.example.locc.domain.user.dto.command;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

/**
 * User 정보 수정 Command
 */
@Getter
@Builder
public class UserUpdateCommand {

    private final String name;
    private final String gender;
    private final String phoneNumber;
    private final String address;
    private final LocalDate birth;
}
