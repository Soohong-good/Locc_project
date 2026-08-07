package com.example.locc.domain.gallery.service;

import com.example.locc.config.CacheConfig;
import com.example.locc.domain.department.entity.Department;
import com.example.locc.domain.gallery.dto.response.GalleryGroupDto;
import com.example.locc.domain.gallery.dto.response.GalleryGroupResponse;
import com.example.locc.domain.gallery.dto.response.GalleryImageDetailResponse;
import com.example.locc.domain.gallery.dto.response.GalleryImageResponse;
import com.example.locc.domain.gallery.entity.GalleryImage;
import com.example.locc.domain.gallery.repository.GalleryImageRepository;
import com.example.locc.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
     * 부서별 갤러리 이미지 목록 조회 (게시판 형태)
     * groupId별로 그룹화하여 첫 번째 이미지만 표시, 이미지 개수 포함
     */
    public Page<GalleryImageResponse> getImageListForBoard(String departmentCode, int page) {
        PageRequest pageRequest = PageRequest.of(page, 10);

        Page<GalleryImage> imagePage = galleryImageRepository.findByDepartmentCodeForBoard(
                departmentCode,
                pageRequest
        );

        // groupId 목록을 모아 한 번의 쿼리로 개수 조회 (N+1 방지)
        List<String> groupIds = imagePage.getContent().stream()
                .map(GalleryImage::getGroupId)
                .toList();

        Map<String, Integer> imageCountMap = galleryImageRepository.countByGroupIds(groupIds)
                .stream()
                .collect(java.util.stream.Collectors.toMap(
                        row -> (String) row[0],
                        row -> ((Long) row[1]).intValue()
                ));

        return imagePage.map(image ->
                GalleryImageResponse.from(image, imageCountMap.getOrDefault(image.getGroupId(), 1))
        );
    }

    /**
     * 통합 갤러리 이미지 목록 조회 (게시판 형태)
     * departmentCode가 null이면 전체 부서(교회 갤러리 제외), 있으면 해당 코드만 필터링
     * groupId별로 그룹화하여 첫 번째 이미지만 표시, 이미지 개수 포함
     */
    public Page<GalleryImageResponse> getImageListForBoardAll(String departmentCode, int page) {
        PageRequest pageRequest = PageRequest.of(page, 12);
        Page<GalleryImage> imagePage = galleryImageRepository.findForBoard(departmentCode, Department.CHURCH_CODE, pageRequest);

        List<String> groupIds = imagePage.getContent().stream()
                .map(GalleryImage::getGroupId)
                .toList();

        Map<String, Integer> imageCountMap = galleryImageRepository.countByGroupIds(groupIds)
                .stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> ((Long) row[1]).intValue()
                ));

        return imagePage.map(image ->
                GalleryImageResponse.from(image, imageCountMap.getOrDefault(image.getGroupId(), 1)));
    }

    /**
     * 이미지 ID로 같은 업로드 그룹의 전체 이미지 조회 (라이트박스/그룹 뷰용)
     */
    public List<GalleryImageResponse> getGroupImagesByImageId(Long imageId) {
        GalleryImage image = galleryImageRepository.findById(imageId)
                .orElseThrow(() -> new NotFoundException("갤러리 이미지를 찾을 수 없습니다."));
        return getImagesByGroupId(image.getGroupId());
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
    @Cacheable(value = CacheConfig.CACHE_GALLERY_TITLES, key = "#departmentCode")
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

    public Long countAll() {
        return galleryImageRepository.count();
    }

    /**
     * 전체 부서 최신 갤러리 그룹 목록 (관리자 대시보드용 - 그룹별 대표 이미지)
     */
    public Page<GalleryDashboardResponse> getLatestGalleryForDashboard(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return galleryImageRepository.findLatestGalleryGroupsAll(pageable)
                .map(GalleryDashboardResponse::from);
    }

    /**
     * 메인 페이지 갤러리 — 최근 업로드 순으로 개별 이미지 반환 (그룹 구분 없음)
     */
    public Page<GalleryDashboardResponse> getLatestImagesForMain(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return galleryImageRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(GalleryDashboardResponse::from);
    }

    /**
     * 대시보드 갤러리 응답 DTO (내부 전용)
     */
    public record GalleryDashboardResponse(
            Long id,
            String title,
            String departmentCode,
            String departmentName,
            String thumbnailFilename,
            String storedFilename,
            String uploaderName,
            java.time.LocalDateTime createdAt
    ) {
        public static GalleryDashboardResponse from(com.example.locc.domain.gallery.entity.GalleryImage image) {
            return new GalleryDashboardResponse(
                    image.getId(),
                    image.getTitle(),
                    image.getDepartment().getCode(),
                    image.getDepartment().getName(),
                    image.getThumbnailFilename(),
                    image.getStoredFilename(),
                    image.getUploader().getName(),
                    image.getCreatedAt()
            );
        }
    }
}
