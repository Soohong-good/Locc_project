package com.example.locc.domain.bulletin.service;

import com.example.locc.domain.bulletin.dto.response.BulletinDetailResponse;
import com.example.locc.domain.bulletin.dto.response.BulletinResponse;
import com.example.locc.domain.bulletin.entity.Bulletin;
import com.example.locc.domain.bulletin.repository.BulletinRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Bulletin Query Service
 * - 조회 전용
 * - @Transactional(readOnly = true) 적용
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BulletinQueryService {

    private final BulletinRepository bulletinRepository;

    /**
     * 주보 목록 조회 (페이징)
     */
    public Page<BulletinResponse> getBulletins(Pageable pageable) {
        return bulletinRepository.findList(pageable)
                .map(BulletinResponse::from);
    }

    /**
     * 주보 검색 (제목 + 내용)
     */
    public Page<BulletinResponse> searchBulletins(String keyword, Pageable pageable) {
        return bulletinRepository.search(keyword, pageable)
                .map(BulletinResponse::from);
    }

    /**
     * 주보 상세 조회
     */
    public BulletinDetailResponse getBulletinDetail(Long id) {
        Bulletin bulletin = bulletinRepository.findDetailById(id)
                .orElseThrow(() -> new IllegalArgumentException("주보를 찾을 수 없습니다. ID: " + id));

        return BulletinDetailResponse.from(bulletin);
    }
}
