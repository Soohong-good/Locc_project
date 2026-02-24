package com.example.locc.domain.user.controller;

import com.example.locc.domain.user.dto.request.UserPasswordChangeRequest;
import com.example.locc.domain.user.dto.request.UserProfileUpdateRequest;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.domain.user.service.UserMyPageService;
import com.example.locc.exception.NotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

/**
 * 마이페이지 ApiController
 */
@Slf4j
@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class UserMyPageApiController {

    private final UserMyPageService myPageService;
    private final UserRepository userRepository;

    /**
     * 사용자 정보 조회
     */
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getUserInfo(Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        return ResponseEntity.ok(Map.of(
                "name", user.getName(),
                "email", user.getEmail(),
                "phone", user.getPhoneNumber() != null ? user.getPhoneNumber() : ""
        ));
    }

    /**
     * 프로필 정보 수정
     */
    @PutMapping("/profile")
    public ResponseEntity<Map<String, String>> updateProfile(
            Principal principal,
            @Valid @RequestBody UserProfileUpdateRequest request,
            BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            String errorMessage = bindingResult.getAllErrors().get(0).getDefaultMessage();
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", errorMessage
            ));
        }

        try {
            myPageService.updateProfile(principal.getName(), request.toCommand());
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "프로필이 수정되었습니다."
            ));
        } catch (Exception e) {
            log.error("프로필 수정 실패", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", "error",
                    "message", "프로필 수정에 실패했습니다."
            ));
        }
    }

    /**
     * 비밀번호 변경
     */
    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(
            Principal principal,
            @Valid @RequestBody UserPasswordChangeRequest request,
            BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            String errorMessage = bindingResult.getAllErrors().get(0).getDefaultMessage();
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", errorMessage
            ));
        }

        // 새 비밀번호 확인
        if (!request.getNewPassword().equals(request.getNewPasswordConfirm())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "새 비밀번호가 일치하지 않습니다."
            ));
        }

        try {
            myPageService.changePassword(
                    principal.getName(),
                    request.getCurrentPassword(),
                    request.getNewPassword()
            );
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "비밀번호가 변경되었습니다."
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("비밀번호 변경 실패", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", "error",
                    "message", "비밀번호 변경에 실패했습니다."
            ));
        }
    }
}
