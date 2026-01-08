package com.example.locc.domain.gallery.controller;

import com.example.locc.domain.gallery.service.GalleryImageQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

/**
 * 갤러리 화면 컨트롤러
 */
@Slf4j
@Controller
@RequestMapping("/departments/{departmentCode}/gallery")
@RequiredArgsConstructor
public class GalleryImageViewController {

    private final GalleryImageQueryService queryService;

    /**
     * 갤러리 목록 페이지
     * GET /departments/{departmentCode}/gallery
     */
    @GetMapping
    public String galleryPage(
            @PathVariable String departmentCode,
            Model model
    ) {
        // 제목 목록 조회 (title 기준)
        List<String> titles = queryService.getTitles(departmentCode);

        model.addAttribute("departmentCode", departmentCode);
        model.addAttribute("titles", titles);

        return "gallery/gallery";
    }
}
