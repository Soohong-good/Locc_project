package com.example.locc.controller;

import com.example.locc.config.KakaoProperties;
import com.example.locc.domain.newyear.entity.NewYear;
import com.example.locc.domain.newyear.service.NewYearService;
import com.example.locc.domain.notice.dto.response.NoticeResponse;
import com.example.locc.domain.notice.service.NoticeQueryService;
import com.example.locc.domain.sermon.dto.response.SermonResponse;
import com.example.locc.domain.sermon.service.SermonQueryService;
import com.example.locc.domain.staff.dto.response.StaffResponse;
import com.example.locc.domain.staff.entity.Staff;
import com.example.locc.domain.staff.service.StaffQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.Map;

@Slf4j
@Controller
@RequiredArgsConstructor
public class MainController {

    private final SermonQueryService sermonQueryService;
    private final NoticeQueryService noticeQueryService;
    private final StaffQueryService staffQueryService;
    private final KakaoProperties kakaoProperties;
    private final NewYearService newYearService;
     

    @GetMapping("/")
    public String home(Model model) {
        log.info("Accessing main page");

        // 송구영신예배 최신 정보
        NewYear newYearVideo = newYearService.getLatest();
        model.addAttribute("newYearVideo", newYearVideo);
        
        // 주일오전 최신 설교 1개
        List<SermonResponse> sundaySermons = sermonQueryService.findLatestByCategory("주일오전", 1);
        model.addAttribute("latestSermon", sundaySermons.isEmpty() ? null : sundaySermons.get(0));
        
        // 주일오전 최근 설교 5개 (썸네일용)
        List<SermonResponse> recentSundaySermons = sermonQueryService.findLatestByCategory("주일오전", 5);
        model.addAttribute("recentSundaySermons", recentSundaySermons);

        // 고정 공지사항 조회
        List<NoticeResponse> pinnedNotices = noticeQueryService.findPinned();
        model.addAttribute("pinnedNotices", pinnedNotices);
        
        // 최근 비고정 공지사항 5개 (메인 페이지용)
        List<NoticeResponse> recentNotices = noticeQueryService.findLatestUnpinned(5);
        model.addAttribute("recentNotices", recentNotices);

        // 카카오 맵 API 키
        model.addAttribute("kakaoMapApiKey", kakaoProperties.getApiKey());

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
    public String staff(Model model) {
        log.info("Accessing staff page");
        return "church/staff";
    }

    @GetMapping("/church/staff/minister")
    public String staffMinisterSection(Model model) {
        log.info("Loading minister section");
        
        // 교역자(MINISTER) 카테고리만 조회
        List<StaffResponse> allMinisterStaff = staffQueryService.findByCategory(Staff.StaffCategory.MINISTER);
        
        // 담임목사 (PASTOR + isSeniorPastor=true)
        List<StaffResponse> seniorPastors = allMinisterStaff.stream()
                .filter(staff -> staff.getPosition() == Staff.StaffPosition.PASTOR && staff.getIsSeniorPastor())
                .toList();
        
        // 부목사 (PASTOR + isSeniorPastor=false)
        List<StaffResponse> pastors = allMinisterStaff.stream()
                .filter(staff -> staff.getPosition() == Staff.StaffPosition.PASTOR && !staff.getIsSeniorPastor())
                .toList();
        
        // 전도사 (EVANGELIST)
        List<StaffResponse> evangelists = allMinisterStaff.stream()
                .filter(staff -> staff.getPosition() == Staff.StaffPosition.EVANGELIST)
                .toList();
        
        // 협력목사 (OTHER + customPosition="협력목사")
        List<StaffResponse> associatePastors = allMinisterStaff.stream()
                .filter(staff -> staff.getPosition() == Staff.StaffPosition.OTHER 
                        && "협력목사".equals(staff.getCustomPosition()))
                .toList();
        
        // 협력단체 (OTHER 중 협력목사가 아닌 것들)
        List<StaffResponse> others = allMinisterStaff.stream()
                .filter(staff -> staff.getPosition() == Staff.StaffPosition.OTHER 
                        && !"협력목사".equals(staff.getCustomPosition()))
                .toList();
        
        model.addAttribute("seniorPastors", seniorPastors);
        model.addAttribute("pastors", pastors);
        model.addAttribute("evangelists", evangelists);
        model.addAttribute("associatePastors", associatePastors);
        model.addAttribute("others", others);
        
        return "church/staff/minister-section :: content";
    }

    @GetMapping("/church/staff/employee")
    public String staffEmployeeSection(Model model) {
        log.info("Loading employee section");
        
        // 교회 직원(EMPLOYEE) 카테고리만 조회
        List<StaffResponse> employees = staffQueryService.findByCategory(Staff.StaffCategory.EMPLOYEE);
        
        model.addAttribute("employees", employees);
        
        return "church/staff/employee-section :: content";
    }

    @GetMapping("/church/first-visit")
    public String firstVisit() {
        log.info("Accessing first visit section");
        return "church/first-visit";
    }

    @GetMapping("/church/contact")
    public String contact(Model model) {
        log.info("Accessing contact page");
        model.addAttribute("kakaoMapApiKey", kakaoProperties.getApiKey());
        return "church/contact";
    }

    @GetMapping("/church/confession")
    public String confession() {
        log.info("Accessing Westminster Confession page");
        return "church/confession";
    }

    @GetMapping("/church/mission")
    public String mission() {
        log.info("Accessing mission page");
        return "church/mission";
    }

    // ==================== 예배 ====================

    // 단축 경로 (호환성)
    @GetMapping("/sermon")
    public String sermonShort() {
        return "redirect:/worship/sermon/sunday-morning/list";
    }

    // 실제 경로
    @GetMapping("/worship")
    public String worship() {
        log.info("Accessing worship page");
        return "redirect:/worship/sermon/sunday-morning";
    }


    @GetMapping("/worship/training-intro")
    public String trainingIntro() {
        log.info("Accessing training intro page");
        return "worship/training-intro";
    }

    // ==================== 부서 ====================

//    GetMapping("/department") # 추후에 부서 전체 소개페이지 작업
//    public String department(){
//    log.info("Accessing Department Page");
//    return "department/about";
//    }
    @GetMapping("/department")
    public String department() {
        log.info("Accessing Department page");
        return "department/department";
    }

    // ==================== 구원의 길 ====================

    @GetMapping("/salvation")
    public String salvation() {
        log.info("Accessing salvation page");
        return "salvation";
    }
}