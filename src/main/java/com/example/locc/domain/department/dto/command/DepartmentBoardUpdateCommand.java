package com.example.locc.domain.department.dto.command;

import lombok.Getter;

@Getter
public class DepartmentBoardUpdateCommand {
    
    private final Long id;
    private final String title;
    private final String content;

    public DepartmentBoardUpdateCommand(Long id, String title, String content) {
        this.id = id;
        this.title = title;
        this.content = content;
    }
}
