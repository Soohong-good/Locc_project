package com.example.locc.domain.helprequest.service;

import com.example.locc.domain.helprequest.dto.command.UpdateAdminMemoCommand;
import com.example.locc.domain.helprequest.dto.command.UpdateHelpRequestStatusCommand;
import com.example.locc.domain.helprequest.dto.request.HelpRequestCreateRequest;
import com.example.locc.domain.helprequest.dto.response.HelpRequestResponse;
import com.example.locc.domain.helprequest.entity.HelpRequest;
import com.example.locc.domain.helprequest.repository.HelpRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 도움 요청 Command Service
 * - 생성, 수정, 삭제, 상태 변경
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class HelpRequestCommandService {

    private final HelpRequestRepository helpRequestRepository;

    /**
     * 도움 요청 생성
     */
    public HelpRequestResponse create(HelpRequestCreateRequest request) {
        // 엔티티 생성
        HelpRequest helpRequest = HelpRequest.create(
                request.getName(),
                request.getPhone(),
                request.getEmail(),
                request.getContent()
        );

        // 저장
        HelpRequest saved = helpRequestRepository.save(helpRequest);

        log.info("[도움 요청 생성] ID: {}, 이름: {}, 이메일: {}",
                saved.getId(), saved.getName(), saved.getEmail());

        return HelpRequestResponse.from(saved);
    }

    /**
     * 상태 변경 (관리자)
     */
    public HelpRequestResponse updateStatus(Long id, UpdateHelpRequestStatusCommand command) {
        HelpRequest helpRequest = helpRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("도움요청을 찾을 수 없습니다: " + id));

        helpRequest.updateStatus(command.getStatus());

        log.info("[도움 요청 상태 변경] ID: {}, 상태: {}", id, command.getStatus());

        return HelpRequestResponse.from(helpRequest);
    }

    /**
     * 관리자 메모 작성/수정 (관리자)
     */
    public HelpRequestResponse updateAdminMemo(Long id, UpdateAdminMemoCommand command) {
        HelpRequest helpRequest = helpRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("도움요청을 찾을 수 없습니다: " + id));

        helpRequest.updateAdminMemo(command.getAdminMemo());

        log.info("[도움 요청 메모 수정] ID: {}", id);

        return HelpRequestResponse.from(helpRequest);
    }

    /**
     * 도움 요청 삭제 (관리자)
     */
    public void delete(Long id) {
        HelpRequest helpRequest = helpRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("도움요청을 찾을 수 없습니다: " + id));

        helpRequestRepository.delete(helpRequest);

        log.info("[도움 요청 삭제] ID: {}", id);
    }
}
