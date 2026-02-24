package com.example.locc.domain.helprequest.dto.command;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 관리자 메모 수정 Command
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAdminMemoCommand {
    private String adminMemo;
}
