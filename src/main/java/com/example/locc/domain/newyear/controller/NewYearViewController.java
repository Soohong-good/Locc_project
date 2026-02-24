package com.example.locc.domain.newyear.controller;

import com.example.locc.domain.newyear.entity.NewYear;
import com.example.locc.domain.newyear.service.NewYearService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * NewYear ViewController
 * - 송구영신예배 페이지 렌더링
 */
@Slf4j
@Controller
@RequestMapping("/worship/newyear")
@RequiredArgsConstructor
public class NewYearViewController {

    private final NewYearService newYearService;

    /**
     * 송구영신예배 페이지
     */
    @GetMapping
    public String newyear(Model model) {
        log.info("Accessing New Year Service page");
        
        NewYear newYear = newYearService.getLatest();
        model.addAttribute("newYear", newYear);
        
        return "worship/newyear";
    }
}
