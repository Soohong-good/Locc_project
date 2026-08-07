package com.example.locc.domain.bulletin.service;

import com.example.locc.domain.bulletin.dto.command.BulletinCreateCommand;
import com.example.locc.domain.bulletin.dto.command.BulletinUpdateCommand;
import com.example.locc.domain.bulletin.dto.response.BulletinDetailResponse;
import com.example.locc.domain.bulletin.entity.Bulletin;
import com.example.locc.domain.bulletin.repository.BulletinRepository;
import com.example.locc.domain.file.service.FileCommandService;
import com.example.locc.domain.user.entity.AreaType;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.domain.user.service.UserPermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Bulletin Command Service
 * - 생성, 수정, 삭제 담당
 * - @Transactional 적용
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class BulletinCommandService {

    private final BulletinRepository bulletinRepository;
    private final UserRepository userRepository;
    private final FileCommandService fileCommandService;
    private final UserPermissionService userPermissionService;

    /**
     * 주보 생성
     */
    public BulletinDetailResponse createBulletin(
            BulletinCreateCommand command,
            MultipartFile file,
            String authorEmail) {

        // 작성 권한 검증 (관리자/운영자 또는 BULLETIN 권한 보유자)
        if (!userPermissionService.hasPermission(authorEmail, AreaType.BULLETIN)) {
            throw new IllegalStateException("주보 작성 권한이 없습니다.");
        }

        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));

        Bulletin bulletin = Bulletin.create(command, author);
        Bulletin saved = bulletinRepository.save(bulletin);

        // 파일 업로드 처리 (PDF 전용)
        if (file != null && !file.isEmpty()) {
            if (!"application/pdf".equals(file.getContentType())) {
                throw new IllegalArgumentException("PDF 파일만 업로드 가능합니다.");
            }

            // PDF 저장(ATTACHMENT) + 썸네일 생성(THUMBNAIL) 을 한 번에 처리
            // uploadFile 을 별도 호출하면 PDF 가 이중 저장되므로 이 메서드만 사용
            FileCommandService.PdfUploadResult result = fileCommandService.uploadBulletinPdf(
                    file,
                    saved.getId(),
                    author
            );

            saved.setFileId(result.pdfFileId());
            saved.update(BulletinUpdateCommand.builder()
                    .title(saved.getTitle())
                    .content(saved.getContent())
                    .thumbnailUrl(result.thumbnailUrl())
                    .build());
        }

        log.info("주보 생성 완료: ID={}, 제목={}", saved.getId(), saved.getTitle());
        return BulletinDetailResponse.from(saved);
    }

    /**
     * 주보 수정
     * - 제목/내용 업데이트
     * - thumbnail 파일이 있으면 PDF 재업로드 + 썸네일 재생성
     */
    public BulletinDetailResponse updateBulletin(Long id, BulletinUpdateCommand command, MultipartFile thumbnail, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));

        Bulletin bulletin = bulletinRepository.findDetailById(id)
                .orElseThrow(() -> new IllegalArgumentException("주보를 찾을 수 없습니다. ID: " + id));

        // 권한 검증
        if (!bulletin.canModify(user)) {
            throw new AccessDeniedException("수정 권한이 없습니다.");
        }

        // 기본 필드(제목/내용) 업데이트
        bulletin.update(command);

        // 새 파일이 첨부된 경우 PDF 재업로드 + 썸네일 갱신
        if (thumbnail != null && !thumbnail.isEmpty()) {
            if (!"application/pdf".equals(thumbnail.getContentType())) {
                throw new IllegalArgumentException("PDF 파일만 업로드 가능합니다.");
            }
            FileCommandService.PdfUploadResult result = fileCommandService.uploadBulletinPdf(
                    thumbnail, bulletin.getId(), user);
            bulletin.setFileId(result.pdfFileId());
            bulletin.update(BulletinUpdateCommand.builder()
                    .title(bulletin.getTitle())
                    .content(bulletin.getContent())
                    .thumbnailUrl(result.thumbnailUrl())
                    .build());
        }

        log.info("주보 수정 완료: ID={}, 제목={}", bulletin.getId(), bulletin.getTitle());
        return BulletinDetailResponse.from(bulletin);
    }

    /**
     * 주보 삭제
     */
    public void deleteBulletin(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));

        Bulletin bulletin = bulletinRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("주보를 찾을 수 없습니다. ID: " + id));

        // 권한 검증
        if (!bulletin.canModify(user)) {
            throw new AccessDeniedException("삭제 권한이 없습니다.");
        }

        bulletinRepository.delete(bulletin);
        log.info("주보 삭제 완료: ID={}", id);
    }

    /**
     * 본문 에디터 이미지 업로드 (Notice·PraiseSheet와 동일 방식)
     * @return 공개 이미지 URL (/api/files/image/{id})
     */
    public String uploadContentImage(MultipartFile image, String email) {
        if (!userPermissionService.hasPermission(email, AreaType.BULLETIN)) {
            throw new IllegalStateException("주보 작성 권한이 없습니다.");
        }
        return fileCommandService.uploadBulletinContentImage(image, email);
    }

    /**
     * 조회수 증가
     */
    public void increaseViewCount(Long id) {
        Bulletin bulletin = bulletinRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("주보를 찾을 수 없습니다. ID: " + id));

        bulletin.increaseViews();
        log.debug("주보 조회수 증가: ID={}, 조회수={}", id, bulletin.getViewCount());
    }
}
