package com.example.locc.domain.bulletin.dto.response;

import com.example.locc.domain.bulletin.entity.Bulletin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 주보 목록 응답 DTO
 */
@Getter
@Builder
@AllArgsConstructor
public class BulletinResponse {
    private Long id;
    private String title;
    private String thumbnailUrl;
    private Long fileId;              // 기존 PDF 파일 ID — 수정 모달 현재 파일 표시용
    private String authorName;
    private String authorId;          // 작성자 UUID — 프론트 본인 여부 판단용
    private String authorRole;        // ADMIN/OPERATOR/USER — 프론트에서 "관리자" 표기 판단용
    private Integer viewCount;
    private LocalDateTime createdAt;

    public static BulletinResponse from(Bulletin bulletin) {
        return BulletinResponse.builder()
                .id(bulletin.getId())
                .title(bulletin.getTitle())
                .thumbnailUrl(bulletin.getThumbnailUrl())
                .fileId(bulletin.getFileId())
                .authorName(bulletin.getAuthor() != null ? bulletin.getAuthor().getName() : "알 수 없음")
                .authorId(bulletin.getAuthor() != null ? bulletin.getAuthor().getId().toString() : null)
                .authorRole(bulletin.getAuthor() != null ? bulletin.getAuthor().getRole().name() : null)
                .viewCount(bulletin.getViewCount())
                .createdAt(bulletin.getCreatedAt())
                .build();
    }
}
