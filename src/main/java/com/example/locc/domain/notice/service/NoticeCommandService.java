package com.example.locc.domain.notice.service;

import com.example.locc.domain.notice.entity.Notice;
import com.example.locc.domain.notice.dto.command.NoticeCreateCommand;
import com.example.locc.domain.notice.dto.command.NoticeUpdateCommand;
import com.example.locc.domain.notice.dto.response.NoticeDetailResponse;
import com.example.locc.domain.notice.repository.NoticeRepository;
import com.example.locc.domain.file.dto.response.AttachmentInfo;
import com.example.locc.domain.user.entity.AreaType;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.domain.user.service.UserPermissionService;
import com.example.locc.domain.file.service.FileCommandService;
import com.example.locc.domain.file.service.FileQueryService;
import com.example.locc.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Notice 명령 전용 서비스
 * - CUD 작업만 처리
 * - 트랜잭션 관리
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NoticeCommandService {

    private final NoticeRepository noticeRepository;
    private final NoticeQueryService noticeQueryService;
    private final UserRepository userRepository;
    private final FileCommandService fileCommandService;
    private final FileQueryService fileQueryService;
    private final UserPermissionService userPermissionService;

    /**
     * Notice 생성
     */
    public NoticeDetailResponse create(NoticeCreateCommand command) {
        log.debug("Creating notice: {}", command.getTitle());

        // 작성 권한 검증 (관리자/운영자 또는 NOTICE 권한 보유자)
        if (!userPermissionService.hasPermission(command.getCreatedByEmail(), AreaType.NOTICE)) {
            throw new IllegalStateException("공지사항 작성 권한이 없습니다.");
        }

        // 사용자 조회
        User author = findUserByEmail(command.getCreatedByEmail());

        // Entity 생성 (팩토리 메서드 사용)
        Notice notice = Notice.create(command.withDefaults(), author);
        Notice savedNotice = noticeRepository.save(notice);

        // 파일 업로드
        List<AttachmentInfo> files = uploadFiles(savedNotice.getId(), command);

        return NoticeDetailResponse.from(savedNotice, files);
    }

    /**
     * Notice 수정
     */
    public NoticeDetailResponse update(NoticeUpdateCommand command) {
        log.debug("Updating notice: {}", command.getNoticeId());

        // Notice 조회
        Notice notice = noticeQueryService.findById(command.getNoticeId());

        // 권한 검증
        User user = findUserByEmail(command.getUpdatedByEmail());
        validateModifyPermission(notice, user);

        // 수정 (Entity 메서드 사용)
        notice.update(command);

        // 파일 업로드
        List<AttachmentInfo> files = uploadFiles(notice.getId(), command);

        return NoticeDetailResponse.from(notice, files);
    }

    /**
     * Notice 삭제
     */
    public void delete(Long noticeId, String email) {
        log.debug("Deleting notice: {}", noticeId);

        Notice notice = noticeQueryService.findById(noticeId);
        User user = findUserByEmail(email);

        // 권한 검증
        validateModifyPermission(notice, user);

        // 파일 먼저 삭제
        fileCommandService.deleteNoticeFiles(noticeId);

        // Notice 삭제
        noticeRepository.delete(notice);
    }

    /**
     * 본문 이미지 업로드 (에디터용)
     */
    public String uploadContentImage(MultipartFile image, String email) {
        if (!userPermissionService.hasPermission(email, AreaType.NOTICE)) {
            throw new IllegalStateException("공지사항 작성 권한이 없습니다.");
        }
        return fileCommandService.uploadNoticeContentImage(image, email);
    }

    /**
     * 조회수 증가
     */
    public void increaseViews(Long noticeId) {
        log.debug("Increasing views for notice: {}", noticeId);
        
        Notice notice = noticeQueryService.findById(noticeId);
        notice.increaseViews();
    }

    /**
     * 고정 토글
     */
    public void togglePin(Long noticeId, String email) {
        log.debug("Toggling pin for notice: {}", noticeId);

        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new NotFoundException("공지사항을 찾을 수 없습니다. ID: " + noticeId));
        User user = findUserByEmail(email);

        // 관리자 권한 확인
        if (!user.isAdmin()) {
            throw new IllegalStateException("관리자만 공지사항을 고정할 수 있습니다.");
        }

        notice.togglePin();
        noticeRepository.save(notice);
    }

    // ===== Private Helper Methods =====

    /**
     * 파일 업로드
     */
    private List<AttachmentInfo> uploadFiles(Long noticeId, NoticeCreateCommand command) {
        if (command.getFiles() == null || command.getFiles().isEmpty()) {
            return List.of();
        }

        return fileCommandService.uploadNoticeAttachments(
                        command.getFiles(),
                        noticeId,
                        command.getCreatedByEmail()
                )
                .stream()
                .map(AttachmentInfo::from)
                .collect(Collectors.toList());
    }

    /**
     * 파일 업로드 (수정용)
     */
    private List<AttachmentInfo> uploadFiles(Long noticeId, NoticeUpdateCommand command) {
        if (command.getFiles() == null || command.getFiles().isEmpty()) {
            return fileQueryService.getNoticeAttachments(noticeId);
        }

        return fileCommandService.uploadNoticeAttachments(
                        command.getFiles(),
                        noticeId,
                        command.getUpdatedByEmail()
                )
                .stream()
                .map(AttachmentInfo::from)
                .collect(Collectors.toList());
    }

    /**
     * 사용자 조회
     */
    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));
    }

    /**
     * 수정 권한 검증
     */
    private void validateModifyPermission(Notice notice, User user) {
        if (!notice.canModify(user)) {
            throw new IllegalStateException("권한이 없습니다.");
        }
    }
}
