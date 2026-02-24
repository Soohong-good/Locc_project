package com.example.locc.domain.training.dto.command;

/**
 * 신청서 생성 커맨드
 */
public record CreateApplicationCommand(
        Long trainingId,
        String phone,
        String paymentMethod
) {
}
