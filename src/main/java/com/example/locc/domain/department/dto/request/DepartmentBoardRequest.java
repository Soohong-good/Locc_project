package com.example.locc.domain.department.dto.request;

import com.example.locc.domain.department.dto.command.DepartmentBoardCreateCommand;
import com.example.locc.domain.department.dto.command.DepartmentBoardUpdateCommand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DepartmentBoardRequest {

    @NotBlank(message = "제목을 입력해주세요")
    @Size(max = 200, message = "제목은 200자 이내로 입력해주세요")
    private String title;

    @NotBlank(message = "내용을 입력해주세요")
    private String content;

    public DepartmentBoardCreateCommand toCreateCommand(String departmentCode) {
        return new DepartmentBoardCreateCommand(departmentCode, title, content);
    }

    public DepartmentBoardUpdateCommand toUpdateCommand(Long id) {
        return new DepartmentBoardUpdateCommand(id, title, content);
    }
}
