package com.example.locc.domain.user.dto.command;

import lombok.Builder;
import lombok.Getter;

/**
 * User 로그인 Command
 */
@Getter
@Builder
public class UserLoginCommand {

    private final String email;
    private final String password;
}
