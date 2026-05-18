package com.example.locc.domain.popup.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.domain.popup.dto.request.PopupCreateRequest;
import com.example.locc.domain.popup.dto.request.PopupUpdateRequest;
import com.example.locc.domain.popup.dto.response.PopupDetailResponse;
import com.example.locc.domain.popup.dto.response.PopupResponse;
import com.example.locc.domain.popup.service.PopupCommandService;
import com.example.locc.domain.popup.service.PopupQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * 팝업 API Controller
 */
@Slf4j
@RestController
@RequestMapping("/api/popups")
@RequiredArgsConstructor
public class PopupApiController {

    private final PopupCommandService popupCommandService;
    private final PopupQueryService popupQueryService;

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<PopupResponse>>> getActivePopups(Authentication authentication) {
        boolean isLoggedIn = authentication != null
                && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal());
        return ResponseEntity.ok(ApiResponse.ok(popupQueryService.getActivePopups(isLoggedIn)));
    }

    @PostMapping("/upload-image")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(
            @RequestParam("image") MultipartFile image,
            Authentication authentication) {

        log.debug("팝업 에디터 이미지 업로드: filename={}, size={}", image.getOriginalFilename(), image.getSize());
        String imageUrl = popupCommandService.uploadContentImage(image, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(Map.of("url", imageUrl)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PopupDetailResponse>> createPopup(
            @Valid @ModelAttribute PopupCreateRequest request, Authentication authentication) {
        PopupDetailResponse response = popupCommandService.createPopup(request.toCommand(), authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PopupDetailResponse>> updatePopup(
            @PathVariable Long id,
            @Valid @ModelAttribute PopupUpdateRequest request,
            Authentication authentication) {
        PopupDetailResponse response = popupCommandService.updatePopup(id, request.toCommand(), authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePopup(@PathVariable Long id, Authentication authentication) {
        popupCommandService.deletePopup(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<PopupDetailResponse>> toggleActive(@PathVariable Long id, Authentication authentication) {
        PopupDetailResponse response = popupCommandService.toggleActive(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PopupDetailResponse>> getPopupDetail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(popupQueryService.getPopupDetail(id)));
    }
}
