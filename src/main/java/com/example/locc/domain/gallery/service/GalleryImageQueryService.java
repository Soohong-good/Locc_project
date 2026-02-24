package com.example.locc.domain.gallery.service;

import com.example.locc.domain.gallery.dto.request.GalleryImageSearchCondition;
import com.example.locc.domain.gallery.dto.response.GalleryGroupDto;
import com.example.locc.domain.gallery.dto.response.GalleryGroupResponse;
import com.example.locc.domain.gallery.dto.response.GalleryImageDetailResponse;
import com.example.locc.domain.gallery.dto.response.GalleryImageResponse;
import com.example.locc.domain.gallery.entity.GalleryImage;
import com.example.locc.domain.gallery.repository.GalleryImageRepository;
import com.example.locc.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GalleryImageQueryService {

    private final GalleryImageRepository galleryImageRepository;

    /**
     * 부서별 갤러리 이미지 목록 조회 (무한 스크롤)
     * 현재는 사용하지 않음 - groups API 사용
     */
    public Slice<GalleryImageResponse> getImageList(GalleryImageSearchCondition condition) {
        PageRequest pageRequest = PageRequest.of(condition.page(), condition.size());

        // 전체 이미지 조회만 지원
        Slice<GalleryImage> imagePage = galleryImageRepository.findByDepartmentCode(
                condition.departmentCode(),
                pageRequest
        );

        return imagePage.map(GalleryImageResponse::from);
    }

    /**
     * 부서별 갤러리 이미지 목록 조회 (게시판 형태)
     * groupId별로 그룹화하여 첫 번째 이미지만 표시, 이미지 개수 포함
     */
    public Page<GalleryImageResponse> getImageListForBoard(String departmentCode, int page) {
        PageRequest pageRequest = PageRequest.of(page, 10);

        Page<GalleryImage> imagePage = galleryImageRepository.findByDepartmentCodeForBoard(
                departmentCode,
                pageRequest
        );

        // 각 그룹별 이미지 개수 계산
        Map<String, Integer> imageCountMap = new HashMap<>();
        for (GalleryImage image : imagePage.getContent()) {
            int count = galleryImageRepository.findAllByGroupId(image.getGroupId()).size();
            imageCountMap.put(image.getGroupId(), count);
        }

        return imagePage.map(image ->
                GalleryImageResponse.from(image, imageCountMap.get(image.getGroupId()))
        );
    }

    /**
     * 인스타그램 스타일: 부서별 갤러리 그룹 목록 조회 (title 기준 + 페이징)
     * 최적화: DTO 프로젝션으로 필요한 데이터만 조회 (1개 쿼리)
     */
    public Page<GalleryGroupResponse> getGalleryGroups(String departmentCode, Pageable pageable) {
        // DTO 프로젝션으로 한 번에 조회
        return galleryImageRepository
                .findGalleryGroupsByDepartmentCode(departmentCode, pageable)
                .map(GalleryGroupDto::toResponse);
    }

    /**
     * 특정 제목의 모든 이미지 조회 (라이트박스용)
     */
    public List<GalleryImageResponse> getImagesByTitle(String departmentCode, String title) {
        return galleryImageRepository
                .findAllByDepartmentCodeAndTitle(departmentCode, title)
                .stream()
                .map(GalleryImageResponse::from)
                .toList();
    }

    /**
     * 갤러리 이미지 상세 조회
     */
    public GalleryImageDetailResponse getImageDetail(Long id) {
        GalleryImage image = galleryImageRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("갤러리 이미지를 찾을 수 없습니다."));

        return GalleryImageDetailResponse.from(image);
    }

    /**
     * 부서별 제목 목록 조회 (중복 제거)
     */
    public List<String> getTitles(String departmentCode) {
        return galleryImageRepository.findTitlesByDepartmentCode(departmentCode);
    }
    
    /**
     * groupId로 모든 이미지 조회 (상세 페이지용)
     */
    public List<GalleryImageResponse> getImagesByGroupId(String groupId) {
        return galleryImageRepository.findAllByGroupId(groupId)
                .stream()
                .map(image -> GalleryImageResponse.from(image, 1))
                .toList();
    }
}
