package com.example.locc.domain.gallery.repository;

import com.example.locc.domain.gallery.dto.response.GalleryGroupDto;
import com.example.locc.domain.gallery.entity.GalleryImage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GalleryImageRepository extends JpaRepository<GalleryImage, Long> {

    /**
     * 부서별 갤러리 이미지 목록 조회 (무한 스크롤용 Slice)
     */
    @EntityGraph(attributePaths = {"department", "uploader"})
    @Query("SELECT gi FROM GalleryImage gi WHERE gi.department.code = :departmentCode ORDER BY gi.displayOrder DESC, gi.createdAt DESC")
    Slice<GalleryImage> findByDepartmentCode(@Param("departmentCode") String departmentCode, Pageable pageable);

    /**
     * 부서별 갤러리 이미지 목록 조회 (게시판용 Page)
     * groupId별로 첫 번째 이미지만 표시 (1 업로드 = 1 게시물)
     */
    @EntityGraph(attributePaths = {"department", "uploader"})
    @Query("""
        SELECT gi FROM GalleryImage gi
        WHERE gi.department.code = :departmentCode
        AND gi.id IN (
            SELECT MIN(gi2.id)
            FROM GalleryImage gi2
            WHERE gi2.department.code = :departmentCode
            GROUP BY gi2.groupId
        )
        ORDER BY gi.createdAt DESC
        """)
    Page<GalleryImage> findByDepartmentCodeForBoard(@Param("departmentCode") String departmentCode, Pageable pageable);
    
    /**
     * groupId로 모든 이미지 조회 (상세 페이지용)
     */
    @EntityGraph(attributePaths = {"department", "uploader"})
    @Query("SELECT gi FROM GalleryImage gi WHERE gi.groupId = :groupId ORDER BY gi.displayOrder, gi.id")
    List<GalleryImage> findAllByGroupId(@Param("groupId") String groupId);

    /**
     * 갤러리 이미지 상세 조회
     */
    @EntityGraph(attributePaths = {"department", "uploader"})
    Optional<GalleryImage> findById(Long id);

    /**
     * 부서별 갤러리 그룹 정보 조회 (DTO 프로젝션 + 페이징)
     * 성능 최적화: 필요한 컬럼만 SELECT
     */
    @Query("""
        SELECT new com.example.locc.domain.gallery.dto.response.GalleryGroupDto(
            gi.title,
            COUNT(gi),
            MIN(gi.storedFilename),
            MIN(gi.thumbnailFilename)
        )
        FROM GalleryImage gi
        WHERE gi.department.code = :departmentCode
        AND gi.title IS NOT NULL
        GROUP BY gi.title
        ORDER BY MAX(gi.createdAt) DESC
        """)
    Page<GalleryGroupDto> findGalleryGroupsByDepartmentCode(
            @Param("departmentCode") String departmentCode,
            Pageable pageable
    );

    /**
     * 부서별 제목 목록 조회 (중복 제거)
     */
    @Query("SELECT DISTINCT gi.title FROM GalleryImage gi WHERE gi.department.code = :departmentCode AND gi.title IS NOT NULL ORDER BY gi.title")
    List<String> findTitlesByDepartmentCode(@Param("departmentCode") String departmentCode);

    /**
     * 부서별 특정 제목의 모든 이미지 조회 (인스타그램 스타일)
     * 정렬: displayOrder 내림차순 → createdAt 내림차순 → id 내림차순
     */
    @EntityGraph(attributePaths = {"department", "uploader"})
    @Query("SELECT gi FROM GalleryImage gi WHERE gi.department.code = :departmentCode AND gi.title = :title ORDER BY gi.displayOrder DESC, gi.createdAt DESC, gi.id DESC")
    List<GalleryImage> findAllByDepartmentCodeAndTitle(@Param("departmentCode") String departmentCode, @Param("title") String title);


}
