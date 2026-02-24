package com.example.locc.domain.gallery.controller;

import com.example.locc.domain.gallery.dto.response.GalleryImageDetailResponse;
import com.example.locc.domain.gallery.dto.response.GalleryImageResponse;
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

    /**
     * 갤러리 이미지 상세 페이지
     * GET /departments/{departmentCode}/gallery/{imageId}
     */
    @GetMapping("/{imageId}")
    public String galleryDetail(
            @PathVariable String departmentCode,
            @PathVariable Long imageId,
            Model model
    ) {
        GalleryImageDetailResponse image = queryService.getImageDetail(imageId);
        
        // 같은 그룹의 모든 이미지 조회 (한 업로드의 모든 이미지)
        List<GalleryImageResponse> groupImages = queryService.getImagesByGroupId(image.groupId());

        model.addAttribute("departmentCode", departmentCode);
        model.addAttribute("image", image);
        model.addAttribute("groupImages", groupImages);

        return "department/gallery-detail";
    }
}
