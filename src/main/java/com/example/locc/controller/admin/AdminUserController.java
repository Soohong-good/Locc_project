package com.example.locc.controller.admin;

import com.example.locc.entity.User;
import com.example.locc.repository.UserRepository;
import com.example.locc.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.UUID;

@Slf4j
@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;
    private final UserRepository userRepository;

    /**
     * 관리자 홈
     */
    @GetMapping
    public String adminHome(Model model) {
        // 대시보드 통계
        Long pendingCount = userRepository.countByApprovalStatus(User.ApprovalStatus.PENDING);
        Long totalUsers = userRepository.count();
        
        model.addAttribute("pendingCount", pendingCount);
        model.addAttribute("totalUsers", totalUsers);
        model.addAttribute("currentMenu", "dashboard");
        
        return "admin/dashboard";
    }

    /**
     * 회원 목록 (전체)
     */
    @GetMapping("/users")
    public String listUsers(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Model model) {
        Page<User> users = userService.getAllUsers(pageable);
        model.addAttribute("users", users);
        model.addAttribute("currentMenu", "users");
        return "admin/user/list";
    }

    /**
     * 승인 대기 회원 목록
     */
    @GetMapping("/users/pending")
    public String listPendingUsers(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Model model) {
        Page<User> pendingUsers = userService.getPendingUsers(pageable);
        model.addAttribute("users", pendingUsers);
        model.addAttribute("currentMenu", "pending");
        return "admin/user/pending";
    }

    /**
     * 회원 상세
     */
    @GetMapping("/users/{id}")
    public String userDetail(@PathVariable UUID id, Model model) {
        User user = userService.getUserById(id);
        model.addAttribute("user", user);
        return "admin/user/detail";
    }

    /**
     * 회원가입 승인
     */
    @PostMapping("/users/{id}/approve")
    public String approveUser(@PathVariable UUID id, RedirectAttributes redirectAttributes) {
        try {
            userService.approveUser(id);
            redirectAttributes.addFlashAttribute("message", "회원가입이 승인되었습니다.");
            redirectAttributes.addFlashAttribute("messageType", "success");
        } catch (Exception e) {
            log.error("Failed to approve user: {}", id, e);
            redirectAttributes.addFlashAttribute("message", "승인 처리 중 오류가 발생했습니다: " + e.getMessage());
            redirectAttributes.addFlashAttribute("messageType", "error");
        }
        return "redirect:/admin/users/pending";
    }

    /**
     * 회원가입 반려
     */
    @PostMapping("/users/{id}/reject")
    public String rejectUser(
            @PathVariable UUID id,
            @RequestParam String reason,
            RedirectAttributes redirectAttributes) {
        try {
            userService.rejectUser(id, reason);
            redirectAttributes.addFlashAttribute("message", "회원가입이 반려되었습니다.");
            redirectAttributes.addFlashAttribute("messageType", "success");
        } catch (Exception e) {
            log.error("Failed to reject user: {}", id, e);
            redirectAttributes.addFlashAttribute("message", "반려 처리 중 오류가 발생했습니다: " + e.getMessage());
            redirectAttributes.addFlashAttribute("messageType", "error");
        }
        return "redirect:/admin/users/pending";
    }

    /**
     * 회원 삭제
     */
    @PostMapping("/users/{id}/delete")
    public String deleteUser(@PathVariable UUID id, RedirectAttributes redirectAttributes) {
        try {
            userService.deleteUser(id);
            redirectAttributes.addFlashAttribute("message", "회원이 삭제되었습니다.");
            redirectAttributes.addFlashAttribute("messageType", "success");
        } catch (Exception e) {
            log.error("Failed to delete user: {}", id, e);
            redirectAttributes.addFlashAttribute("message", "삭제 처리 중 오류가 발생했습니다: " + e.getMessage());
            redirectAttributes.addFlashAttribute("messageType", "error");
        }
        return "redirect:/admin/users";
    }
}
