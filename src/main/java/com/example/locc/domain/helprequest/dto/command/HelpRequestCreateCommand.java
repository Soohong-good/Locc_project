package com.example.locc.domain.helprequest.dto.command;

import lombok.Builder;
import lombok.Getter;

/**
 * 도움 요청 생성 커맨드
 * - Service 레이어 입력 전용
 */
@Getter
@Builder
public class HelpRequestCreateCommand {

    private final String name;
    private final String phone;
    private final String email;
    private final String content;
}
