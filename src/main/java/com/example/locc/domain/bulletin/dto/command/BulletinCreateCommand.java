package com.example.locc.domain.bulletin.dto.command;

import lombok.Builder;
import lombok.Getter;

/**
 * 주보 생성 Command
 */
@Getter
@Builder
public class BulletinCreateCommand {
    private String title;
    private String content;
    private String thumbnailUrl;
}
