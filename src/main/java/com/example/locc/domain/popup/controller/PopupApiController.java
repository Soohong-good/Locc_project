package com.example.locc.domain.popup.controller;

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

import java.util.List;

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

    /**
     * 현재 활성 팝업 조회 (프론트엔드용)
     * GET /api/popups/active
     */
    @GetMapping("/active")
    public ResponseEntity<List<PopupResponse>> getActivePopups(Authentication authentication) {
        boolean isLoggedIn = authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal());

        List<PopupResponse> popups = popupQueryService.getActivePopups(isLoggedIn);
        return ResponseEntity.ok(popups);
    }

    /**
     * 팝업 생성
     * POST /api/popups
     */
    @PostMapping
    public ResponseEntity<PopupDetailResponse> createPopup(
            @Valid @ModelAttribute PopupCreateRequest request,
            Authentication authentication) {

        String username = authentication.getName();
        PopupDetailResponse response = popupCommandService.createPopup(request.toCommand(), username);

        return ResponseEntity.ok(response);
    }

    /**
     * 팝업 수정
     * PUT /api/popups/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<PopupDetailResponse> updatePopup(
            @PathVariable Long id,
            @Valid @ModelAttribute PopupUpdateRequest request,
            Authentication authentication) {

        String username = authentication.getName();
        PopupDetailResponse response = popupCommandService.updatePopup(id, request.toCommand(), username);

        return ResponseEntity.ok(response);
    }

    /**
     * 팝업 삭제
     * DELETE /api/popups/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePopup(
            @PathVariable Long id,
            Authentication authentication) {

        String username = authentication.getName();
        popupCommandService.deletePopup(id, username);

        return ResponseEntity.noContent().build();
    }

    /**
     * 팝업 활성화 토글
     * PATCH /api/popups/{id}/toggle
     */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<PopupDetailResponse> toggleActive(
            @PathVariable Long id,
            Authentication authentication) {

        String username = authentication.getName();
        PopupDetailResponse response = popupCommandService.toggleActive(id, username);

        return ResponseEntity.ok(response);
    }

    /**
     * 팝업 상세 조회
     * GET /api/popups/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<PopupDetailResponse> getPopupDetail(@PathVariable Long id) {
        PopupDetailResponse response = popupQueryService.getPopupDetail(id);
        return ResponseEntity.ok(response);
    }
}
