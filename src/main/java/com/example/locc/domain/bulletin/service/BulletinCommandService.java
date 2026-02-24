package com.example.locc.domain.bulletin.service;

import com.example.locc.domain.bulletin.dto.command.BulletinCreateCommand;
import com.example.locc.domain.bulletin.dto.command.BulletinUpdateCommand;
import com.example.locc.domain.bulletin.dto.response.BulletinDetailResponse;
import com.example.locc.domain.bulletin.entity.Bulletin;
import com.example.locc.domain.bulletin.repository.BulletinRepository;
import com.example.locc.domain.file.entity.File;
import com.example.locc.domain.file.service.FileCommandService;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
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

    /**
     * 주보 생성
     */
    public BulletinDetailResponse createBulletin(
            BulletinCreateCommand command, 
            MultipartFile file,
            String authorEmail) {
        
        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + authorEmail));

        Bulletin bulletin = Bulletin.create(command, author);
        Bulletin saved = bulletinRepository.save(bulletin);

        // 파일 업로드 처리 (PDF 전용)
        if (file != null && !file.isEmpty()) {
            // PDF 파일 검증
            if (!"application/pdf".equals(file.getContentType())) {
                throw new IllegalArgumentException("PDF 파일만 업로드 가능합니다.");
            }
            
            // 원본 PDF 파일 저장
            File pdfFile = fileCommandService.uploadFile(
                    file,
                    File.EntityType.BULLETIN,
                    saved.getId(),
                    File.FileCategory.ATTACHMENT,
                    author
            );
            
            // 썸네일 생성
            String thumbnailUrl = fileCommandService.uploadPdfWithThumbnail(
                    file,
                    File.EntityType.BULLETIN,
                    saved.getId(),
                    author
            );
            
            // 파일 ID와 썸네일 URL 업데이트
            saved.setFileId(pdfFile.getId());
            saved.update(BulletinUpdateCommand.builder()
                    .title(saved.getTitle())
                    .content(saved.getContent())
                    .thumbnailUrl(thumbnailUrl)
                    .build());
        }

        log.info("주보 생성 완료: ID={}, 제목={}", saved.getId(), saved.getTitle());
        return BulletinDetailResponse.from(saved);
    }

    /**
     * 주보 수정
     */
    public BulletinDetailResponse updateBulletin(Long id, BulletinUpdateCommand command, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + userEmail));

        Bulletin bulletin = bulletinRepository.findDetailById(id)
                .orElseThrow(() -> new IllegalArgumentException("주보를 찾을 수 없습니다. ID: " + id));

        // 권한 검증
        if (!bulletin.canModify(user)) {
            throw new AccessDeniedException("수정 권한이 없습니다.");
        }

        bulletin.update(command);

        log.info("주보 수정 완료: ID={}, 제목={}", bulletin.getId(), bulletin.getTitle());
        return BulletinDetailResponse.from(bulletin);
    }

    /**
     * 주보 삭제
     */
    public void deleteBulletin(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + userEmail));

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
     * 조회수 증가
     */
    public void increaseViewCount(Long id) {
        Bulletin bulletin = bulletinRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("주보를 찾을 수 없습니다. ID: " + id));

        bulletin.increaseViews();
        log.debug("주보 조회수 증가: ID={}, 조회수={}", id, bulletin.getViewCount());
    }
}
