package com.example.locc.domain.user.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.domain.user.dto.request.UserPasswordChangeRequest;
import com.example.locc.domain.user.dto.request.UserProfileUpdateRequest;
import com.example.locc.domain.user.dto.response.UserDetailResponse;
import com.example.locc.domain.user.service.UserMyPageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

/**
 * 마이페이지 ApiController
 */
@Slf4j
@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class UserMyPageApiController {

    private final UserMyPageService myPageService;

    /**
     * 사용자 정보 조회
     */
    @GetMapping("/info")
    public ResponseEntity<ApiResponse<UserDetailResponse>> getUserInfo(Principal principal) {
        return ResponseEntity.ok(ApiResponse.ok(myPageService.getUserInfo(principal.getName())));
    }

    /**
     * 프로필 정보 수정
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Void>> updateProfile(
            Principal principal,
            @Valid @RequestBody UserProfileUpdateRequest request) {

        myPageService.updateProfile(principal.getName(), request.toCommand());
        return ResponseEntity.ok(ApiResponse.ok(null, "프로필이 수정되었습니다."));
    }

    /**
     * 비밀번호 변경
     */
    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Principal principal,
            @Valid @RequestBody UserPasswordChangeRequest request) {

        myPageService.changePassword(
                principal.getName(),
                request.getCurrentPassword(),
                request.getNewPassword()
        );
        return ResponseEntity.ok(ApiResponse.ok(null, "비밀번호가 변경되었습니다."));
    }
}
