package com.example.locc.domain.bulletin.dto.command;

import lombok.Builder;
import lombok.Getter;

/**
 * 주보 수정 Command
 */
@Getter
@Builder
public class BulletinUpdateCommand {
    private String title;
    private String content;
    private String thumbnailUrl;
}
