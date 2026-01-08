package com.example.locc.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * JavaScript 모듈 테스트 컨트롤러
 */
@Controller
@RequestMapping("/modules")
public class ModuleTestController {

    /**
     * JavaScript 모듈 테스트 페이지
     */
    @GetMapping
    public String test() {
        return "modules/test";
    }
}
