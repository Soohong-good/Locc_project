package com.example.locc.controller.admin;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin/department")
public class DepartmentYouTubeAdminController {

    /**
     * 부서 YouTube 관리 페이지
     */
    @GetMapping("/youtube")
    public String youtubeManagementPage() {
        return "admin/department-youtube";
    }
}
