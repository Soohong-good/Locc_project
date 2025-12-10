package com.example.locc.service;

import com.example.locc.dto.NoticeDto;
import com.example.locc.entity.Notice;
import com.example.locc.entity.User;
import com.example.locc.exception.NoticeNotFoundException;
import com.example.locc.repository.NoticeRepository;
import com.example.locc.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final UserRepository userRepository;

    /**
     * 페이징된 전체 공지사항 조회
     */
    public Page<NoticeDto> findAll(Pageable pageable) {
        log.debug("Fetching all notices with pagination: {}", pageable);
        return noticeRepository.findAllPaged(pageable)
                .map(this::convertToDto);
    }

    /**
     * ID로 공지사항 조회
     */
    public NoticeDto findById(Long id) {
        log.debug("Fetching notice by id: {}", id);
        return noticeRepository.findByIdWithAll(id)
                .map(this::convertToDto)
                .orElseThrow(() -> new NoticeNotFoundException(id));
    }

    /**
     * 고정된 공지사항 조회
     */
    public List<NoticeDto> findPinned() {
        log.debug("Fetching pinned notices");
        return noticeRepository.findPinned().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * 키워드로 공지사항 검색
     */
    public Page<NoticeDto> search(String keyword, Pageable pageable) {
        log.debug("Searching notices with keyword: {} and pagination: {}", keyword, pageable);
        return noticeRepository.search(keyword, pageable)
                .map(this::convertToDto);
    }

    /**
     * 조회수 증가
     */
    @Transactional
    public void increaseViews(Long id) {
        log.debug("Increasing view count for notice id: {}", id);
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new NoticeNotFoundException(id));
        notice.increaseViewCount();
    }

    /**
     * 공지사항 생성
     */
    @Transactional
    public NoticeDto create(NoticeDto noticeDto, String email) {
        log.info("Creating new notice: {} by user: {}", noticeDto.getTitle(), email);

        // 사용자 조회
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + email));

        Notice notice = Notice.builder()
                .title(noticeDto.getTitle())
                .content(noticeDto.getContent())
                .createdBy(user)  // ✅ User 관계 설정
                .isPinned(noticeDto.getIsPinned() != null ? noticeDto.getIsPinned() : false)
                .build();

        Notice savedNotice = noticeRepository.save(notice);
        return convertToDto(savedNotice);
    }

    /**
     * 공지사항 수정
     */
    @Transactional
    public NoticeDto update(Long id, NoticeDto noticeDto, String email) {
        log.info("Updating notice id: {} by user: {}", id, email);

        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new NoticeNotFoundException(id));

        // 권한 체크 (작성자 본인 또는 관리자만 수정 가능)
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + email));

        if (!notice.getCreatedBy().getId().equals(currentUser.getId()) &&
                !currentUser.getRole().equals(User.Role.ADMIN)) {
            throw new IllegalStateException("공지사항을 수정할 권한이 없습니다.");
        }

        notice.setTitle(noticeDto.getTitle());
        notice.setContent(noticeDto.getContent());

        if (noticeDto.getIsPinned() != null) {
            notice.setIsPinned(noticeDto.getIsPinned());
        }

        return convertToDto(notice);
    }

    /**
     * 공지사항 삭제 (Hard Delete)
     */
    @Transactional
    public void delete(Long id, String email) {
        log.info("Deleting notice id: {} by user: {}", id, email);

        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new NoticeNotFoundException(id));

        // 권한 체크 (작성자 본인 또는 관리자만 삭제 가능)
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + email));

        if (!notice.getCreatedBy().getId().equals(currentUser.getId()) &&
                !currentUser.getRole().equals(User.Role.ADMIN)) {
            throw new IllegalStateException("공지사항을 삭제할 권한이 없습니다.");
        }

        // DB에서 실제로 삭제
        noticeRepository.delete(notice);
    }

    /**
     * Entity를 DTO로 변환
     */
    private NoticeDto convertToDto(Notice notice) {
        NoticeDto.NoticeDtoBuilder builder = NoticeDto.builder()
                .id(notice.getId())
                .title(notice.getTitle())
                .content(notice.getContent())
                .viewCount(notice.getViewCount())
                .isPinned(notice.getIsPinned())
                .createdAt(notice.getCreatedAt());
        
        // 작성자 정보 추가
        if (notice.getCreatedBy() != null) {
            builder.createdById(notice.getCreatedBy().getId())
                   .createdByEmail(notice.getCreatedBy().getEmail())
                   .createdByName(notice.getCreatedBy().getName());
        }
        
        // 첨부파일 정보 추가
        if (notice.getAttachments() != null && !notice.getAttachments().isEmpty()) {
            List<com.example.locc.dto.AttachmentDto> attachmentDtos = notice.getAttachments().stream()
                    .map(attachment -> com.example.locc.dto.AttachmentDto.builder()
                            .id(attachment.getId())
                            .originalFilename(attachment.getOriginalFileName())
                            .storedFilename(attachment.getStoredFileName())
                            .fileSize(attachment.getFileSize())
                            .contentType(attachment.getContentType())
                            .build())
                    .collect(Collectors.toList());
            builder.attachments(attachmentDtos);
        }
        
        return builder.build();
    }
}