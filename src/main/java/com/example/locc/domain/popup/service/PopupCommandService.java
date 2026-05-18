package com.example.locc.domain.popup.service;

import com.example.locc.domain.file.service.FileCommandService;
import com.example.locc.domain.popup.dto.command.PopupCreateCommand;
import com.example.locc.domain.popup.dto.command.PopupUpdateCommand;
import com.example.locc.domain.popup.dto.response.PopupDetailResponse;
import com.example.locc.domain.popup.entity.Popup;
import com.example.locc.domain.popup.repository.PopupRepository;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * 팝업 Command Service
 * - 생성, 수정, 삭제, 활성화 토글
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PopupCommandService {

    private final FileCommandService fileCommandService;
    private final PopupRepository popupRepository;
    private final UserRepository userRepository;

    /**
     * 팝업 생성
     */
    /**
     * 본문 이미지 업로드 (에디터용)
     */
    public String uploadContentImage(MultipartFile image, String email) {
        return fileCommandService.uploadPopupContentImage(image, email);
    }

    public PopupDetailResponse createPopup(PopupCreateCommand command, String username) {
        log.info("팝업 생성 시작 - 사용자: {}, 제목: {}", username, command.getTitle());

        User creator = userRepository.findByEmail(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));

        if (!creator.isAdmin()) {
            throw new AccessDeniedException("관리자만 팝업을 생성할 수 있습니다");
        }

        Popup popup = Popup.create(command, creator);
        Popup savedPopup = popupRepository.save(popup);

        log.info("팝업 생성 완료 - ID: {}", savedPopup.getId());
        return PopupDetailResponse.from(savedPopup);
    }

    /**
     * 팝업 수정
     */
    public PopupDetailResponse updatePopup(Long id, PopupUpdateCommand command, String username) {
        log.info("팝업 수정 시작 - ID: {}, 사용자: {}", id, username);

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));

        Popup popup = popupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("팝업을 찾을 수 없습니다"));

        if (!popup.canModify(user)) {
            throw new AccessDeniedException("팝업을 수정할 권한이 없습니다");
        }

        popup.update(command);

        log.info("팝업 수정 완료 - ID: {}", id);
        return PopupDetailResponse.from(popup);
    }

    /**
     * 팝업 삭제
     */
    public void deletePopup(Long id, String username) {
        log.info("팝업 삭제 시작 - ID: {}, 사용자: {}", id, username);

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));

        Popup popup = popupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("팝업을 찾을 수 없습니다"));

        if (!popup.canModify(user)) {
            throw new AccessDeniedException("팝업을 삭제할 권한이 없습니다");
        }

        popupRepository.delete(popup);

        log.info("팝업 삭제 완료 - ID: {}", id);
    }

    /**
     * 팝업 활성화 토글
     */
    public PopupDetailResponse toggleActive(Long id, String username) {
        log.info("팝업 활성화 토글 시작 - ID: {}, 사용자: {}", id, username);

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));

        Popup popup = popupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("팝업을 찾을 수 없습니다"));

        if (!popup.canModify(user)) {
            throw new AccessDeniedException("팝업 활성화를 변경할 권한이 없습니다");
        }

        popup.toggleActive();

        log.info("팝업 활성화 토글 완료 - ID: {}, 활성화: {}", id, popup.getIsActive());
        return PopupDetailResponse.from(popup);
    }
}
