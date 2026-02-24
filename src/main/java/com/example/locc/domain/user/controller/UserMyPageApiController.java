package com.example.locc.domain.user.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.domain.user.dto.request.UserPasswordChangeRequest;
import com.example.locc.domain.user.dto.request.UserProfileUpdateRequest;
import com.example.locc.domain.user.dto.response.UserDetailResponse;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.domain.user.service.UserMyPageService;
import com.example.locc.exception.InvalidInputException;
import com.example.locc.exception.NotFoundException;
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
    private final UserRepository userRepository;

    /**
     * 사용자 정보 조회
     */
    @GetMapping("/info")
    public ResponseEntity<ApiResponse<UserDetailResponse>> getUserInfo(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
        return ResponseEntity.ok(ApiResponse.ok(UserDetailResponse.from(user)));
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

        if (!request.getNewPassword().equals(request.getNewPasswordConfirm())) {
            throw new InvalidInputException("새 비밀번호가 일치하지 않습니다.");
        }

        myPageService.changePassword(
                principal.getName(),
                request.getCurrentPassword(),
                request.getNewPassword()
        );
        return ResponseEntity.ok(ApiResponse.ok(null, "비밀번호가 변경되었습니다."));
    }
}
