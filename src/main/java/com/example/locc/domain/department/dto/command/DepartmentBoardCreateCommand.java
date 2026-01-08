package com.example.locc.domain.department.dto.command;

import lombok.Getter;

@Getter
public class DepartmentBoardCreateCommand {
    
    private final String departmentCode;
    private final String title;
    private final String content;

    public DepartmentBoardCreateCommand(String departmentCode, String title, String content) {
        this.departmentCode = departmentCode;
        this.title = title;
        this.content = content;
    }
}
