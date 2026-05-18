package com.example.locc.domain.notice.service;

import com.example.locc.domain.notice.entity.Notice;
import com.example.locc.domain.notice.dto.request.NoticeSearchCondition;
import com.example.locc.domain.notice.dto.response.NoticeDetailResponse;
import com.example.locc.domain.notice.dto.response.NoticeResponse;
import com.example.locc.domain.notice.repository.NoticeRepository;
import com.example.locc.domain.file.dto.response.AttachmentInfo;
import com.example.locc.exception.NotFoundException;
import com.example.locc.domain.file.service.FileQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Notice 조회 전용 서비스
 * - 읽기 전용 트랜잭션
 * - Command Service와 책임 분리
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeQueryService {

    private final NoticeRepository noticeRepository;
    private final FileQueryService fileQueryService;

    /**
     * 목록 조회
     */
    public Page<NoticeResponse> findList(NoticeSearchCondition condition) {
        log.debug("Finding notice list with condition: {}", condition);
        
        Page<Notice> notices = condition.hasKeyword()
                ? noticeRepository.search(condition.getKeyword(), condition.toPageable())
                : noticeRepository.findList(condition.toPageable());
        
        // 공지사항 ID 목록 추출
        List<Long> noticeIds = notices.getContent().stream()
                .map(Notice::getId)
                .collect(Collectors.toList());
        
        // 첨부파일 개수를 한 번에 조회 (N+1 방지)
        Map<Long, Long> fileCountMap = fileQueryService.countNoticeAttachments(noticeIds);
        
        return notices.map(notice -> {
            long fileCount = fileCountMap.getOrDefault(notice.getId(), 0L);
            return NoticeResponse.from(notice, fileCount > 0);
        });
    }

    /**
     * 상세 조회
     */
    public NoticeDetailResponse findDetail(Long id) {
        log.debug("Finding notice detail: {}", id);
        
        Notice notice = noticeRepository.findDetailById(id)
                .orElseThrow(() -> new NotFoundException("공지사항을 찾을 수 없습니다. ID: " + id));
        
        // 파일 정보 조회
        List<AttachmentInfo> files = fileQueryService.getNoticeAttachments(id);
        
        return NoticeDetailResponse.from(notice, files);
    }

    /**
     * 고정된 공지사항 조회
     */
    public List<NoticeResponse> findPinned() {
        log.debug("Finding pinned notices");
        
        List<Notice> notices = noticeRepository.findPinnedNotices();
        
        // 공지사항 ID 목록 추출
        List<Long> noticeIds = notices.stream()
                .map(Notice::getId)
                .collect(Collectors.toList());
        
        // 첨부파일 개수를 한 번에 조회 (N+1 방지)
        Map<Long, Long> fileCountMap = fileQueryService.countNoticeAttachments(noticeIds);
        
        return notices.stream()
                .map(notice -> {
                    long fileCount = fileCountMap.getOrDefault(notice.getId(), 0L);
                    return NoticeResponse.from(notice, fileCount > 0);
                })
                .collect(Collectors.toList());
    }

    /**
     * 최근 비고정 공지사항 조회 (N개) - 메인 페이지용
     */
    public List<NoticeResponse> findLatestUnpinned(int limit) {
        log.debug("Finding latest {} unpinned notices", limit);
        
        NoticeSearchCondition condition = NoticeSearchCondition.builder()
                .page(0)
                .size(limit)
                .build();
        
        List<Notice> notices = noticeRepository.findUnpinnedList(condition.toPageable())
                .getContent();
        
        // 공지사항 ID 목록 추출
        List<Long> noticeIds = notices.stream()
                .map(Notice::getId)
                .collect(Collectors.toList());
        
        // 첨부파일 개수를 한 번에 조회 (N+1 방지)
        Map<Long, Long> fileCountMap = fileQueryService.countNoticeAttachments(noticeIds);
        
        return notices.stream()
                .map(notice -> {
                    long fileCount = fileCountMap.getOrDefault(notice.getId(), 0L);
                    return NoticeResponse.from(notice, fileCount > 0);
                })
                .collect(Collectors.toList());
    }

    /**
     * ID로 조회 (내부용)
     */
    Notice findById(Long id) {
        return noticeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("공지사항을 찾을 수 없습니다. ID: " + id));
    }

    /**
     * 전체 공지사항 개수 조회 (Admin용)
     */
    public Long countAll() {
        return noticeRepository.count();
    }

    /**
     * 최근 N일 이내 등록된 공지사항 개수 조회 (Admin용)
     */
    public Long countRecent(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return noticeRepository.countByCreatedAtAfter(since);
    }

    /**
     * 관리자용 전체 공지사항 목록 조회 (고정/비고정 모두 포함)
     * - 고정 우선, 최신순 정렬
     */
    public Page<NoticeResponse> findAllForAdmin(NoticeSearchCondition condition) {
        log.debug("Finding all notices for admin with condition: {}", condition);
        
        Page<Notice> notices = noticeRepository.findAllForAdmin(condition.toPageable());
        
        // 공지사항 ID 목록 추출
        List<Long> noticeIds = notices.getContent().stream()
                .map(Notice::getId)
                .collect(Collectors.toList());
        
        // 첨부파일 개수를 한 번에 조회 (N+1 방지)
        Map<Long, Long> fileCountMap = fileQueryService.countNoticeAttachments(noticeIds);
        
        return notices.map(notice -> {
            long fileCount = fileCountMap.getOrDefault(notice.getId(), 0L);
            return NoticeResponse.from(notice, fileCount > 0);
        });
    }
}
