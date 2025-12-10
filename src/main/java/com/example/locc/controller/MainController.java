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

        // 최근 설교 3개 (첫 번째가 최신 설교)
        List<SermonDto> recentSermons = sermonService.findRecent(3);
        model.addAttribute("recentSermons", recentSermons);
        model.addAttribute("latestSermon", recentSermons.isEmpty() ? null : recentSermons.get(0));

        // 최근 공지사항 5개 (고정 공지 포함)
        List<NoticeDto> recentNotices = noticeService.findAll(PageRequest.of(0, 5))
                .getContent();
        model.addAttribute("recentNotices", recentNotices);
        
        // 고정 공지만 필터링 (필요시)
        List<NoticeDto> pinnedNotices = recentNotices.stream()
                .filter(NoticeDto::getIsPinned)
                .toList();
        model.addAttribute("pinnedNotices", pinnedNotices);

        return "main";
    }

    // ==================== 그리스도 사랑 교회 ====================

    // 단축 경로 (호환성)
    @GetMapping("/about")
    public String aboutShort() {
        return "redirect:/church/about";
    }

    @GetMapping("/staff")
    public String staffShort() {
        return "redirect:/church/staff";
    }

    @GetMapping("/contact")
    public String contactShort() {
        return "redirect:/church/contact";
    }

    @GetMapping("/notice")
    public String noticeShort() {
        return "redirect:/church/notice";
    }

    // 실제 경로
    @GetMapping("/church/about")
    public String about() {
        log.info("Accessing about page");
        return "church/about";
    }

    @GetMapping("/church/staff")
    public String staff() {
        log.info("Accessing staff page");
        return "church/staff";
    }

    @GetMapping("/church/contact")
    public String contact() {
        log.info("Accessing contact page");
        return "church/contact";
    }

    // ==================== 예배 ====================

    // 단축 경로 (호환성)
    @GetMapping("/sermon")
    public String sermonShort() {
        return "redirect:/worship/sermon";
    }

    @GetMapping("/message")
    public String messageShort() {
        return "redirect:/worship/message";
    }

    // 실제 경로
    @GetMapping("/worship")
    public String worship() {
        log.info("Accessing worship page");
        return "worship/message";
    }

    @GetMapping("/worship/message")
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