package com.example.locc.domain.gallery.service;

import com.example.locc.config.FileProperties;
import com.example.locc.domain.department.entity.Department;
import com.example.locc.domain.department.repository.DepartmentRepository;
import com.example.locc.domain.gallery.dto.response.GalleryImageDetailResponse;
import com.example.locc.domain.gallery.entity.GalleryImage;
import com.example.locc.domain.gallery.repository.GalleryImageRepository;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.domain.user.service.UserPermissionService;
import com.example.locc.exception.AccessDeniedException;
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
import static org.mockito.Mockito.verify;

/**
 * GalleryImageCommandService 단위 테스트 (Mockito, DB 불필요)
 * - 실제 파일 I/O가 있는 uploadImages()는 대상에서 제외하고, 권한/존재 검증 로직 위주로 검증한다.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("GalleryImageCommandService 단위 테스트")
class GalleryImageCommandServiceTest {

    @Mock private GalleryImageRepository galleryImageRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private UserRepository userRepository;
    @Mock private ThumbnailGenerator thumbnailGenerator;
    @Mock private ImageFileValidator imageFileValidator;
    @Mock private FileProperties fileProperties;
    @Mock private UserPermissionService userPermissionService;

    @InjectMocks private GalleryImageCommandService galleryImageCommandService;

    private GalleryImage newImage(User uploader) {
        Department department = Department.create("nursery", "태영아부", "Nursery Ministry");
        return GalleryImage.create(department, uploader, "제목", "설명",
                "original.jpg", "stored.jpg", "thumb.jpg", 1024L, 0, "group-1");
    }

    @Test
    @DisplayName("조회수 증가 - 이미지가 없으면 NotFoundException")
    void incrementViewCountAndGet_notFound() {
        given(galleryImageRepository.findById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> galleryImageCommandService.incrementViewCountAndGet(1L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("조회수 증가 - 정상 케이스면 조회수가 1 증가한 상세 응답을 반환한다")
    void incrementViewCountAndGet_success() {
        User uploader = mock(User.class);
        given(uploader.getName()).willReturn("홍길동");
        given(uploader.getId()).willReturn(java.util.UUID.randomUUID());
        GalleryImage image = newImage(uploader);
        given(galleryImageRepository.findById(1L)).willReturn(Optional.of(image));

        GalleryImageDetailResponse response = galleryImageCommandService.incrementViewCountAndGet(1L);

        assertThat(response.viewCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("개별 이미지 삭제 - 삭제 권한이 없으면 AccessDeniedException")
    void deleteSingleImage_noPermission() {
        User uploader = mock(User.class);
        User other = mock(User.class);
        GalleryImage image = newImage(uploader);
        given(galleryImageRepository.findById(1L)).willReturn(Optional.of(image));
        given(userRepository.findByEmail("other@test.com")).willReturn(Optional.of(other));
        given(other.isAdminOrOperator()).willReturn(false);

        assertThatThrownBy(() -> galleryImageCommandService.deleteSingleImage(1L, "other@test.com"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("개별 이미지 삭제 - 업로더 본인이면 repository.delete가 호출된다")
    void deleteSingleImage_successAsUploader() {
        User uploader = mock(User.class);
        GalleryImage image = newImage(uploader);
        given(galleryImageRepository.findById(1L)).willReturn(Optional.of(image));
        given(userRepository.findByEmail("uploader@test.com")).willReturn(Optional.of(uploader));

        galleryImageCommandService.deleteSingleImage(1L, "uploader@test.com");

        verify(galleryImageRepository).delete(image);
    }

    @Test
    @DisplayName("그룹 정보 수정 - 수정 권한이 없으면 AccessDeniedException")
    void updateGroup_noPermission() {
        User uploader = mock(User.class);
        User other = mock(User.class);
        GalleryImage image = newImage(uploader);
        given(galleryImageRepository.findById(1L)).willReturn(Optional.of(image));
        given(userRepository.findByEmail("other@test.com")).willReturn(Optional.of(other));
        given(other.isAdminOrOperator()).willReturn(false);

        assertThatThrownBy(() -> galleryImageCommandService.updateGroup(1L, "새 제목", "새 설명", "other@test.com"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("그룹 정보 수정 - 정상 케이스면 그룹 내 전체 이미지의 제목·설명이 반영된다")
    void updateGroup_success() {
        User uploader = mock(User.class);
        GalleryImage image1 = newImage(uploader);
        GalleryImage image2 = newImage(uploader);
        given(galleryImageRepository.findById(1L)).willReturn(Optional.of(image1));
        given(userRepository.findByEmail("uploader@test.com")).willReturn(Optional.of(uploader));
        given(galleryImageRepository.findAllByGroupId("group-1")).willReturn(List.of(image1, image2));

        galleryImageCommandService.updateGroup(1L, "새 제목", "새 설명", "uploader@test.com");

        assertThat(image1.getTitle()).isEqualTo("새 제목");
        assertThat(image2.getTitle()).isEqualTo("새 제목");
        assertThat(image2.getDescription()).isEqualTo("새 설명");
    }

    @Test
    @DisplayName("게시물 삭제 - 그룹 전체가 groupId 기준으로 일괄 삭제된다")
    void deleteImage_deletesWholeGroup() {
        User uploader = mock(User.class);
        GalleryImage image1 = newImage(uploader);
        GalleryImage image2 = newImage(uploader);
        given(galleryImageRepository.findById(1L)).willReturn(Optional.of(image1));
        given(userRepository.findByEmail("uploader@test.com")).willReturn(Optional.of(uploader));
        given(galleryImageRepository.findAllByGroupId("group-1")).willReturn(List.of(image1, image2));

        galleryImageCommandService.deleteImage(1L, "uploader@test.com");

        verify(galleryImageRepository).deleteAllByGroupId("group-1");
    }
}
