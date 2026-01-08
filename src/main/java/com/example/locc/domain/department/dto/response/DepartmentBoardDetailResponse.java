package com.example.locc.domain.department.dto.response;

import com.example.locc.domain.department.entity.DepartmentBoard;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class DepartmentBoardDetailResponse {
    
    private final Long id;
    private final String departmentCode;
    private final String departmentName;
    private final String title;
    private final String content;
    private final String authorName;
    private final Integer viewCount;
    private final Boolean isPinned;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    private DepartmentBoardDetailResponse(Long id, String departmentCode, String departmentName,
                                         String title, String content, String authorName,
                                         Integer viewCount, Boolean isPinned,
                                         LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.departmentCode = departmentCode;
        this.departmentName = departmentName;
        this.title = title;
        this.content = content;
        this.authorName = authorName;
        this.viewCount = viewCount;
        this.isPinned = isPinned;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static DepartmentBoardDetailResponse from(DepartmentBoard board) {
        return new DepartmentBoardDetailResponse(
            board.getId(),
            board.getDepartment().getCode(),
            board.getDepartment().getName(),
            board.getTitle(),
            board.getContent(),
            board.getAuthor().getName(),
            board.getViewCount(),
            board.getIsPinned(),
            board.getCreatedAt(),
            board.getUpdatedAt()
        );
    }
}
