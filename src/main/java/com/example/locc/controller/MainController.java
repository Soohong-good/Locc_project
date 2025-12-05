package com.example.locc.controller;

import com.example.locc.dto.NoticeDto;
import com.example.locc.dto.SermonDto;
import com.example.locc.service.NoticeService;
import com.example.locc.service.SermonService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Slf4j
@Controller
@RequiredArgsConstructor
public class MainController {

    private final SermonService sermonService;
    private final NoticeService noticeService;

    @GetMapping("/")
    public String home(Model model) {
        log.info("Accessing main page");

        // 최신 설교 1개
        SermonDto latestSermon = sermonService.findLatest();
        model.addAttribute("latestSermon", latestSermon);

        // 고정된 공지사항
        List<NoticeDto> pinnedNotices = noticeService.findPinned();
        model.addAttribute("pinnedNotices", pinnedNotices);

        // 최근 공지사항 5개 (페이징 사용)
        List<NoticeDto> recentNotices = noticeService.findAll(PageRequest.of(0, 5))
                .getContent();
        model.addAttribute("recentNotices", recentNotices);

        // 최근 설교 3개
        List<SermonDto> recentSermons = sermonService.findRecent(3);
        model.addAttribute("recentSermons", recentSermons);

        return "main";
    }

    // ==================== 그리스도 사랑 교회 ====================

    @GetMapping("/about")
    public String about() {
        log.info("Accessing about page");
        return "church/about";
    }

    @GetMapping("/staff")
    public String staff() {
        log.info("Accessing staff page");
        return "church/staff";
    }

    @GetMapping("/contact")
    public String contact() {
        log.info("Accessing contact page");
        return "church/contact";
    }

    // ==================== 예배 ====================
    // /sermon, /notice는 각각의 Controller에서 처리

    @GetMapping("/worship")
    public String worship() {
        log.info("Accessing worship page");
        return "worship/message";
    }

    @GetMapping("/message")
    public String message() {
        log.info("Accessing message page");
        return "worship/message";
    }

    // ==================== 부서 ====================

    @GetMapping("/ministry")
    public String ministry() {
        log.info("Accessing ministry page");
        return "department/ministry";
    }

    // ==================== 구원의 길 ====================

    @GetMapping("/salvation")
    public String salvation() {
        log.info("Accessing salvation page");
        return "salvation";
    }
}