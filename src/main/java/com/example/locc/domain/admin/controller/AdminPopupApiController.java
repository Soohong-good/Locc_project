package com.example.locc.domain.admin.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.domain.popup.dto.response.PopupResponse;
import com.example.locc.domain.popup.service.PopupQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 관리자 팝업 API Controller
 * - 팝업 목록 조회 (관리자 전용)
 * - 생성·수정·삭제·토글은 기존 PopupApiController(/api/popups) 사용
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/popups")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminPopupApiController {

    private final PopupQueryService popupQueryService;

    /**
     * 팝업 전체 목록 조회 (isActive 필터 선택적 적용)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PopupResponse>>> getPopups(
            @RequestParam(required = false) Boolean isActive) {
        log.debug("관리자 팝업 목록 조회 - isActive: {}", isActive);

        List<PopupResponse> popups = isActive != null
                ? popupQueryService.getPopupsByActive(isActive)
                : popupQueryService.getAllPopups();

        return ResponseEntity.ok(ApiResponse.ok(popups));
    }
}
