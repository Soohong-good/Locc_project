package com.example.locc.domain.sermon.controller;

import com.example.locc.config.YouTubeProperties;
import com.example.locc.domain.department.service.YouTubeService;
import com.example.locc.domain.sermon.dto.request.SermonSearchCondition;
import com.example.locc.domain.sermon.dto.response.SermonDetailResponse;
import com.example.locc.domain.sermon.dto.response.SermonResponse;
import com.example.locc.domain.sermon.service.SermonQueryService;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.department.service.YouTubeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

/**
 * Sermon ViewController
 * - Thymeleaf 템플릿 반환
 * - QueryService만 사용 (조회만)
 */
@Slf4j
@Controller
@RequestMapping("/worship/sermon")
@RequiredArgsConstructor
public class SermonViewController {

    private final SermonQueryService sermonQueryService;
    private final YouTubeService youTubeService;
    private final YouTubeProperties youTubeProperties;

    // ===== 카테고리별 View =====
    
    /**
     * 주일오전예배
     */
    @GetMapping("/sunday-morning")
    public String sundayMorning(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer serviceNumber,  // 1부/2부 탭
            Authentication authentication,
            Model model) {
        
        log.info("Accessing 주일오전예배 - page: {}, size: {}, keyword: {}, serviceNumber: {}", 
                 page, size, keyword, serviceNumber);

        boolean isAdmin = isAdmin(authentication);

        // 기본값: 2부 (메인)
        int selectedServiceNumber = (serviceNumber != null) ? serviceNumber : 2;

        // YouTube 최신 영상 조회 (재생목록 기반)
        String playlistKey = "sunday-morning-" + selectedServiceNumber;
        String playlistId = youTubeProperties.getPlaylistId(playlistKey);
        List<Map<String, String>> youtubeVideos = List.of();
        
        if (playlistId != null && !playlistId.isEmpty()) {
            youtubeVideos = youTubeService.getLatestVideos(playlistId, 1);
        }

        // 설교 목록 조회 (부 구분 포함)
        Page<SermonResponse> sermons = sermonQueryService.findByCategoryAndServiceNumber(
                "주일오전", 
                selectedServiceNumber, 
                page, 
                size
        );
        
        log.info("조회된 설교 개수: {}", sermons.getTotalElements());
        log.info("현재 페이지 설교 개수: {}", sermons.getContent().size());
        
        // 해당 부의 최신 설교
        List<SermonResponse> latestSermons = sermonQueryService
                .findLatestByCategoryAndServiceNumber("주일오전", selectedServiceNumber, 1);
        SermonResponse latestSermon = latestSermons.isEmpty() ? null : latestSermons.get(0);

        model.addAttribute("sermons", sermons);
        model.addAttribute("latestSermon", latestSermon);
        model.addAttribute("youtubeVideos", youtubeVideos);
        model.addAttribute("selectedServiceNumber", selectedServiceNumber);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", sermons.getTotalPages());
        model.addAttribute("totalItems", sermons.getTotalElements());
        model.addAttribute("isAdmin", isAdmin);
        model.addAttribute("keyword", keyword);
        model.addAttribute("category", "주일오전");

        return "worship/sermon/sunday-morning/list";
    }

    /**
     * 주일오후예배
     */
    @GetMapping("/sunday-afternoon")
    public String sundayAfternoon(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            Authentication authentication,
            Model model) {
        
        log.info("Accessing 주일오후예배 - page: {}, size: {}, keyword: {}", page, size, keyword);

        boolean isAdmin = isAdmin(authentication);

        // YouTube 최신 영상 조회 (재생목록)
        String playlistId = youTubeProperties.getPlaylistId("sunday-afternoon");
        List<Map<String, String>> youtubeVideos = List.of();
        
        if (playlistId != null && !playlistId.isEmpty()) {
            youtubeVideos = youTubeService.getLatestVideos(playlistId, 1);
        }

        SermonSearchCondition condition = SermonSearchCondition.builder()
                .keyword(keyword)
                .category("주일오후")
                .page(page)
                .size(size)
                .sortBy("sermonDate")
                .build();

        Page<SermonResponse> sermons = sermonQueryService.findList(condition);
        
        List<SermonResponse> latestSermons = sermonQueryService.findLatestByCategory("주일오후", 1);
        SermonResponse latestSermon = latestSermons.isEmpty() ? null : latestSermons.get(0);

        model.addAttribute("sermons", sermons);
        model.addAttribute("latestSermon", latestSermon);
        model.addAttribute("youtubeVideos", youtubeVideos);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", sermons.getTotalPages());
        model.addAttribute("totalItems", sermons.getTotalElements());
        model.addAttribute("isAdmin", isAdmin);
        model.addAttribute("keyword", keyword);
        model.addAttribute("category", "주일오후");

        return "worship/sermon/sunday-afternoon/list";
    }

    /**
     * 기타예배 (수요예배, 금요기도회)
     */
    @GetMapping("/weekday")
    public String weekday(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "wednesday") String type,  // wednesday or friday
            Authentication authentication,
            Model model) {
        
        log.info("Accessing 기타예배 - page: {}, size: {}, keyword: {}, type: {}", 
                 page, size, keyword, type);

        boolean isAdmin = isAdmin(authentication);

        // type을 serviceNumber로 변환 (wednesday=1, friday=2)
        int serviceNumber = "wednesday".equals(type) ? 1 : 2;

        // YouTube 최신 영상 조회 (수요예배 또는 금요기도회)
        String playlistId = youTubeProperties.getPlaylistId(type);
        List<Map<String, String>> youtubeVideos = List.of();
        
        if (playlistId != null && !playlistId.isEmpty()) {
            youtubeVideos = youTubeService.getLatestVideos(playlistId, 1);
        }

        // 설교 목록 조회 (부 구분 포함)
        Page<SermonResponse> sermons = sermonQueryService.findByCategoryAndServiceNumber(
                "기타예배", 
                serviceNumber, 
                page, 
                size
        );
        
        // 해당 예배의 최신 설교
        List<SermonResponse> latestSermons = sermonQueryService
                .findLatestByCategoryAndServiceNumber("기타예배", serviceNumber, 1);
        SermonResponse latestSermon = latestSermons.isEmpty() ? null : latestSermons.get(0);

        model.addAttribute("sermons", sermons);
        model.addAttribute("latestSermon", latestSermon);
        model.addAttribute("youtubeVideos", youtubeVideos);
        model.addAttribute("selectedType", type);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", sermons.getTotalPages());
        model.addAttribute("totalItems", sermons.getTotalElements());
        model.addAttribute("isAdmin", isAdmin);
        model.addAttribute("keyword", keyword);
        model.addAttribute("category", "기타예배");

        return "worship/sermon/weekday/list";
    }

    /**
     * 훈련용 메시지 (성경학교, 전교인수련회, 성탄예배 등)
     */
    @GetMapping("/training-message")
    public String trainingMessage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            Authentication authentication,
            Model model) {
        
        log.info("Accessing 훈련용메시지 - page: {}, size: {}, keyword: {}", page, size, keyword);

        boolean isAdmin = isAdmin(authentication);

        SermonSearchCondition condition = SermonSearchCondition.builder()
                .keyword(keyword)
                .category("훈련용메시지")
                .page(page)
                .size(size)
                .sortBy("sermonDate")
                .build();

        Page<SermonResponse> sermons = sermonQueryService.findList(condition);
        
        List<SermonResponse> latestSermons = sermonQueryService.findLatestByCategory("훈련용메시지", 1);
        SermonResponse latestSermon = latestSermons.isEmpty() ? null : latestSermons.get(0);

        model.addAttribute("sermons", sermons);
        model.addAttribute("latestSermon", latestSermon);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", sermons.getTotalPages());
        model.addAttribute("totalItems", sermons.getTotalElements());
        model.addAttribute("isAdmin", isAdmin);
        model.addAttribute("keyword", keyword);
        model.addAttribute("category", "훈련용메시지");

        return "worship/sermon/training-message/list";
    }

    /**
     * 설교 상세 조회
     */
    @GetMapping("/{id}")
    public String sermonDetail(
            @PathVariable Long id,
            Authentication authentication,
            Model model) {
        
        log.info("Accessing sermon detail - id: {}", id);

        // 관리자 권한 체크
        boolean isAdmin = isAdmin(authentication);

        // 상세 조회
        SermonDetailResponse sermon = sermonQueryService.findDetail(id);
        
        model.addAttribute("sermon", sermon);
        model.addAttribute("isAdmin", isAdmin);

        return "worship/sermon/detail";
    }

    /**
     * 최신 설교 조회 (전체 카테고리 중 최신)
     */
    @GetMapping("/latest")
    public String latestSermon(
            Authentication authentication,
            Model model) {
        
        log.info("Accessing latest sermon");

        // 관리자 권한 체크
        boolean isAdmin = isAdmin(authentication);

        // 최신 설교 조회
        List<SermonResponse> latestSermons = sermonQueryService.findLatest(1);
        
        if (latestSermons.isEmpty()) {
            return "redirect:/worship/sermon/sunday-morning";
        }

        // 최신 설교의 상세 정보
        SermonDetailResponse sermon = sermonQueryService.findDetail(latestSermons.get(0).getId());
        
        model.addAttribute("sermon", sermon);
        model.addAttribute("isAdmin", isAdmin);

        return "worship/sermon/detail";
    }



    /**
     * 관리자 권한 확인
     */
    private boolean isAdmin(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            User user = (User) principal;
            return user.isAdmin();
        }

        return false;
    }
}
