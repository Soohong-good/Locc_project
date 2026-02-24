package com.example.locc.domain.helprequest.dto.command;

import com.example.locc.domain.helprequest.entity.HelpRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 도움요청 상태 변경 Command
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateHelpRequestStatusCommand {
    private HelpRequestStatus status;
}
