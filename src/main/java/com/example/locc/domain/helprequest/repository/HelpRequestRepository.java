package com.example.locc.domain.helprequest.repository;

import com.example.locc.domain.helprequest.entity.HelpRequest;
import com.example.locc.domain.helprequest.entity.HelpRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 도움 요청 Repository
 */
@Repository
public interface HelpRequestRepository extends JpaRepository<HelpRequest, Long> {

    /**
     * 상태별 목록 조회 (페이징)
     */
    Page<HelpRequest> findByStatus(HelpRequestStatus status, Pageable pageable);

    /**
     * 전체 목록 조회 (페이징, 최신순)
     */
    Page<HelpRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /**
     * 최근 도움요청 10개 조회
     */
    List<HelpRequest> findTop10ByOrderByCreatedAtDesc();

    /**
     * 상태별 개수 조회
     */
    long countByStatus(HelpRequestStatus status);
}
