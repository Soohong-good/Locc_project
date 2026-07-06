package com.example.locc.domain.gallery.service;

import com.example.locc.domain.department.entity.Department;
import com.example.locc.domain.gallery.dto.response.GalleryImageDetailResponse;
import com.example.locc.domain.gallery.dto.response.GalleryImageResponse;
import com.example.locc.domain.gallery.entity.GalleryImage;
import com.example.locc.domain.gallery.repository.GalleryImageRepository;
import com.example.locc.domain.user.entity.User;
import com.example.locc.exception.NotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;

/**
 * GalleryImageQueryService 단위 테스트 (Mockito, DB 불필요)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("GalleryImageQueryService 단위 테스트")
class GalleryImageQueryServiceTest {

    @Mock private GalleryImageRepository galleryImageRepository;

    @InjectMocks private GalleryImageQueryService galleryImageQueryService;

    private GalleryImage newImage() {
        User uploader = mock(User.class);
        given(uploader.getName()).willReturn("홍길동");
        given(uploader.getId()).willReturn(java.util.UUID.randomUUID());
        Department department = Department.create("nursery", "태영아부", "Nursery Ministry");
        return GalleryImage.create(department, uploader, "제목", "설명",
                "original.jpg", "stored.jpg", "thumb.jpg", 1024L, 0, "group-1");
    }

    @Test
    @DisplayName("이미지 상세 조회 - 이미지가 없으면 NotFoundException")
    void getImageDetail_notFound() {
        given(galleryImageRepository.findById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> galleryImageQueryService.getImageDetail(1L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("이미지 상세 조회 - 정상 케이스면 상세 응답을 반환한다")
    void getImageDetail_success() {
        GalleryImage image = newImage();
        given(galleryImageRepository.findById(1L)).willReturn(Optional.of(image));

        GalleryImageDetailResponse response = galleryImageQueryService.getImageDetail(1L);

        assertThat(response.title()).isEqualTo("제목");
    }

    @Test
    @DisplayName("그룹 이미지 조회 - 이미지가 없으면 NotFoundException")
    void getGroupImagesByImageId_notFound() {
        given(galleryImageRepository.findById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> galleryImageQueryService.getGroupImagesByImageId(1L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("그룹 이미지 조회 - 정상 케이스면 같은 groupId의 이미지 목록을 반환한다")
    void getGroupImagesByImageId_success() {
        GalleryImage image = newImage();
        given(galleryImageRepository.findById(1L)).willReturn(Optional.of(image));
        given(galleryImageRepository.findAllByGroupId("group-1")).willReturn(List.of(image));

        List<GalleryImageResponse> result = galleryImageQueryService.getGroupImagesByImageId(1L);

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("groupId로 이미지 조회 - 매핑된 목록을 반환한다")
    void getImagesByGroupId() {
        GalleryImage image1 = newImage();
        GalleryImage image2 = newImage();
        given(galleryImageRepository.findAllByGroupId("group-1")).willReturn(List.of(image1, image2));

        List<GalleryImageResponse> result = galleryImageQueryService.getImagesByGroupId("group-1");

        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("부서별 제목 목록 조회 - repository 결과를 그대로 반환한다")
    void getTitles() {
        given(galleryImageRepository.findTitlesByDepartmentCode("nursery")).willReturn(List.of("제목1", "제목2"));

        List<String> result = galleryImageQueryService.getTitles("nursery");

        assertThat(result).containsExactly("제목1", "제목2");
    }

    @Test
    @DisplayName("전체 개수 - repository.count()를 그대로 반환한다")
    void countAll() {
        given(galleryImageRepository.count()).willReturn(42L);

        assertThat(galleryImageQueryService.countAll()).isEqualTo(42L);
    }
}
