package com.example.locc.domain.popup.service;

import com.example.locc.domain.popup.dto.response.PopupDetailResponse;
import com.example.locc.domain.popup.dto.response.PopupResponse;
import com.example.locc.domain.popup.entity.Popup;
import com.example.locc.domain.popup.entity.TargetType;
import com.example.locc.domain.popup.repository.PopupRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 팝업 Query Service
 * - 목록 조회, 상세 조회, 활성 팝업 조회
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PopupQueryService {

    private final PopupRepository popupRepository;

    /**
     * 현재 노출 가능한 팝업 목록 조회 (프론트엔드용)
     */
    public List<PopupResponse> getActivePopups(boolean isLoggedIn) {
        log.info("활성 팝업 조회 시작 - 로그인 여부: {}", isLoggedIn);

        LocalDateTime now = LocalDateTime.now();
        List<Popup> popups = popupRepository.findActivePopups(
                now,
                isLoggedIn,
                TargetType.ALL,
                TargetType.MEMBER_ONLY,
                TargetType.GUEST_ONLY
        );

        log.info("활성 팝업 조회 완료 - 개수: {}", popups.size());
        return popups.stream()
                .map(PopupResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 전체 팝업 목록 조회 (관리자용)
     */
    public List<PopupResponse> getAllPopups() {
        log.info("전체 팝업 목록 조회 시작");

        List<Popup> popups = popupRepository.findAllByOrderByCreatedAtDesc();

        log.info("전체 팝업 목록 조회 완료 - 개수: {}", popups.size());
        return popups.stream()
                .map(PopupResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 활성화 상태별 팝업 조회
     */
    public List<PopupResponse> getPopupsByActive(Boolean isActive) {
        log.info("활성화 상태별 팝업 조회 시작 - 활성화: {}", isActive);

        List<Popup> popups = popupRepository.findByIsActiveOrderByPriorityDescCreatedAtDesc(isActive);

        log.info("활성화 상태별 팝업 조회 완료 - 개수: {}", popups.size());
        return popups.stream()
                .map(PopupResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 팝업 상세 조회
     */
    public PopupDetailResponse getPopupDetail(Long id) {
        log.info("팝업 상세 조회 시작 - ID: {}", id);

        Popup popup = popupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("팝업을 찾을 수 없습니다"));

        log.info("팝업 상세 조회 완료 - ID: {}", id);
        return PopupDetailResponse.from(popup);
    }
}
