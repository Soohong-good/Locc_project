package com.example.locc.domain.department.dto.response;

import com.example.locc.domain.department.entity.DepartmentBoard;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class DepartmentBoardResponse {
    
    private final Long id;
    private final String title;
    private final String authorName;
    private final String authorId;   // 작성자 UUID — 프론트 본인 여부 판단용
    private final Integer viewCount;
    private final Boolean isPinned;
    private final LocalDateTime createdAt;

    private DepartmentBoardResponse(Long id, String title, String authorName, String authorId,
                                   Integer viewCount, Boolean isPinned, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.authorName = authorName;
        this.authorId = authorId;
        this.viewCount = viewCount;
        this.isPinned = isPinned;
        this.createdAt = createdAt;
    }

    public static DepartmentBoardResponse from(DepartmentBoard board) {
        return new DepartmentBoardResponse(
            board.getId(),
            board.getTitle(),
            board.getAuthor().getName(),
            board.getAuthor().getId().toString(),
            board.getViewCount(),
            board.getIsPinned(),
            board.getCreatedAt()
        );
    }
}
