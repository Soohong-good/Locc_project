package com.example.locc.domain.popup.controller;

import com.example.locc.domain.popup.dto.response.PopupDetailResponse;
import com.example.locc.domain.popup.dto.response.PopupResponse;
import com.example.locc.domain.popup.entity.TargetType;
import com.example.locc.domain.popup.service.PopupQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

/**
 * 팝업 View Controller (관리자 페이지)
 */
@Slf4j
@Controller
@RequestMapping("/admin/popups")
@RequiredArgsConstructor
public class PopupViewController {

    private final PopupQueryService popupQueryService;

    /**
     * 팝업 목록 페이지
     * GET /admin/popups
     */
    @GetMapping
    public String list(
            @RequestParam(required = false) Boolean isActive,
            Model model) {

        List<PopupResponse> popups;

        if (isActive != null) {
            popups = popupQueryService.getPopupsByActive(isActive);
        } else {
            popups = popupQueryService.getAllPopups();
        }

        model.addAttribute("popups", popups);
        model.addAttribute("filterActive", isActive);

        return "admin/popup/list";
    }

    /**
     * 팝업 생성 폼 페이지
     * GET /admin/popups/new
     */
    @GetMapping("/new")
    public String createForm(Model model) {
        model.addAttribute("targetTypes", TargetType.values());
        return "admin/popup/form";
    }

    /**
     * 팝업 수정 폼 페이지
     * GET /admin/popups/{id}/edit
     */
    @GetMapping("/{id}/edit")
    public String editForm(@PathVariable Long id, Model model) {
        PopupDetailResponse popup = popupQueryService.getPopupDetail(id);
        model.addAttribute("popup", popup);
        model.addAttribute("targetTypes", TargetType.values());
        return "admin/popup/form";
    }

    /**
     * 팝업 상세 페이지
     * GET /admin/popups/{id}
     */
    @GetMapping("/{id}")
    public String detail(@PathVariable Long id, Model model) {
        PopupDetailResponse popup = popupQueryService.getPopupDetail(id);
        model.addAttribute("popup", popup);
        return "admin/popup/detail";
    }
}
