package com.example.locc.controller;

import com.example.locc.dto.SermonDto;
import com.example.locc.service.SermonService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Slf4j
@Controller
@RequestMapping("/sermon")
@RequiredArgsConstructor
public class SermonController {

    private final SermonService sermonService;

    @GetMapping
    public String sermonList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String preacher,
            Model model) {

        log.info("Accessing sermon list - page: {}, size: {}, keyword: {}, preacher: {}",
                page, size, keyword, preacher);

        Pageable pageable = PageRequest.of(page, size);
        Page<SermonDto> sermons;

        if (keyword != null && !keyword.trim().isEmpty()) {
            sermons = sermonService.search(keyword, pageable);
            model.addAttribute("keyword", keyword);
        } else if (preacher != null && !preacher.trim().isEmpty()) {
            sermons = sermonService.findByPreacher(preacher, pageable);
            model.addAttribute("preacher", preacher);
        } else {
            sermons = sermonService.findRecent(pageable);
        }

        model.addAttribute("sermons", sermons);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", sermons.getTotalPages());
        model.addAttribute("totalItems", sermons.getTotalElements());

        return "sermon/list";
    }

    @GetMapping("/{id}")
    public String sermonDetail(@PathVariable Long id, Model model) {
        log.info("Accessing sermon detail - id: {}", id);

        SermonDto sermon = sermonService.findById(id);
        model.addAttribute("sermon", sermon);

        return "sermon/detail";
    }

    @GetMapping("/latest")
    public String latestSermon(Model model) {
        log.info("Accessing latest sermon");

        SermonDto sermon = sermonService.findLatest();
        model.addAttribute("sermon", sermon);

        return "sermon/detail";
    }
}