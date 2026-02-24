package com.example.locc.domain.bibleschool.controller;

import com.example.locc.domain.bibleschool.entity.BibleSchool;
import com.example.locc.domain.bibleschool.service.BibleSchoolService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * BibleSchool ViewController
 * - 성경학교 페이지 렌더링
 */
@Slf4j
@Controller
@RequestMapping("/worship/bibleschool")
@RequiredArgsConstructor
public class BibleSchoolViewController {

    private final BibleSchoolService bibleSchoolService;

    /**
     * 성경학교 페이지
     */
    @GetMapping
    public String bibleschool(Model model) {
        log.info("Accessing Bible School page");
        
        BibleSchool bibleSchool = bibleSchoolService.getLatest();
        model.addAttribute("bibleSchool", bibleSchool);
        
        return "worship/bibleschool";
    }
}
