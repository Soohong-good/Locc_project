package com.example.locc.domain.helprequest.service;

import com.example.locc.domain.helprequest.dto.response.HelpRequestResponse;
import com.example.locc.domain.helprequest.entity.HelpRequestStatus;
import com.example.locc.domain.helprequest.repository.HelpRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * HelpRequest QueryService
 * - 도움요청 조회 전용
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HelpRequestQueryService {

    private final HelpRequestRepository helpRequestRepository;

    /**
     * 전체 도움요청 목록 조회 (페이징)
     */
    public Page<HelpRequestResponse> findAll(Pageable pageable) {
        return helpRequestRepository.findAll(pageable)
                .map(HelpRequestResponse::from);
    }

    /**
     * 상태별 도움요청 목록 조회 (페이징)
     */
    public Page<HelpRequestResponse> findByStatus(HelpRequestStatus status, Pageable pageable) {
        return helpRequestRepository.findByStatus(status, pageable)
                .map(HelpRequestResponse::from);
    }

    /**
     * 관리자용 도움요청 목록 조회 (status 없으면 전체, 있으면 상태 필터)
     * - 정렬: createdAt DESC
     */
    public Page<HelpRequestResponse> getList(HelpRequestStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (status != null) {
            return findByStatus(status, pageable);
        }
        return findAll(pageable);
    }

    /**
     * 최근 도움요청 N개 조회 (대시보드용)
     */
    public List<HelpRequestResponse> findRecent(int limit) {
        return helpRequestRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .limit(limit)
                .map(HelpRequestResponse::from)
                .toList();
    }

    /**
     * 미처리 도움요청 개수
     */
    public long countPending() {
        return helpRequestRepository.countByStatus(HelpRequestStatus.PENDING);
    }

    /**
     * 처리중 도움요청 개수
     */
    public long countInProgress() {
        return helpRequestRepository.countByStatus(HelpRequestStatus.IN_PROGRESS);
    }

    /**
     * 전체 도움요청 개수
     */
    public long countAll() {
        return helpRequestRepository.count();
    }
}
