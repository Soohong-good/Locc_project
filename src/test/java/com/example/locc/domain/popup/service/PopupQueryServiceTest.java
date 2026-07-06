package com.example.locc.domain.popup.service;

import com.example.locc.domain.popup.dto.command.PopupCreateCommand;
import com.example.locc.domain.popup.dto.response.PopupDetailResponse;
import com.example.locc.domain.popup.dto.response.PopupResponse;
import com.example.locc.domain.popup.entity.Popup;
import com.example.locc.domain.popup.entity.TargetType;
import com.example.locc.domain.popup.repository.PopupRepository;
import com.example.locc.domain.user.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;

/**
 * PopupQueryService 단위 테스트 (Mockito, DB 불필요)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("PopupQueryService 단위 테스트")
class PopupQueryServiceTest {

    @Mock private PopupRepository popupRepository;

    @InjectMocks private PopupQueryService popupQueryService;

    private Popup newPopup() {
        User creator = mock(User.class);
        PopupCreateCommand command = mock(PopupCreateCommand.class);
        given(command.getTitle()).willReturn("팝업 제목");
        given(command.getContent()).willReturn("내용");
        given(command.getDisplayStartDate()).willReturn(LocalDateTime.now().minusDays(1));
        given(command.getDisplayEndDate()).willReturn(LocalDateTime.now().plusDays(1));
        return Popup.create(command, creator);
    }

    @Test
    @DisplayName("활성 팝업 조회 - 조건에 맞는 팝업 목록을 반환한다")
    void getActivePopups() {
        Popup popup = newPopup();
        given(popupRepository.findActivePopups(any(LocalDateTime.class), anyBoolean(),
                org.mockito.ArgumentMatchers.eq(TargetType.ALL),
                org.mockito.ArgumentMatchers.eq(TargetType.MEMBER_ONLY),
                org.mockito.ArgumentMatchers.eq(TargetType.GUEST_ONLY)))
                .willReturn(List.of(popup));

        List<PopupResponse> result = popupQueryService.getActivePopups(true);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("팝업 제목");
    }

    @Test
    @DisplayName("전체 팝업 목록 - 생성일 역순으로 매핑된다")
    void getAllPopups() {
        Popup popup1 = newPopup();
        Popup popup2 = newPopup();
        given(popupRepository.findAllByOrderByCreatedAtDesc()).willReturn(List.of(popup1, popup2));

        List<PopupResponse> result = popupQueryService.getAllPopups();

        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("활성화 상태별 팝업 조회 - 상태에 맞는 목록을 반환한다")
    void getPopupsByActive() {
        Popup popup = newPopup();
        given(popupRepository.findByIsActiveOrderByPriorityDescCreatedAtDesc(true))
                .willReturn(List.of(popup));

        List<PopupResponse> result = popupQueryService.getPopupsByActive(true);

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("팝업 상세 조회 - 팝업이 없으면 IllegalArgumentException")
    void getPopupDetail_notFound() {
        given(popupRepository.findById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> popupQueryService.getPopupDetail(1L))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("팝업 상세 조회 - 정상 케이스면 상세 응답을 반환한다")
    void getPopupDetail_success() {
        Popup popup = newPopup();
        given(popupRepository.findById(1L)).willReturn(Optional.of(popup));

        PopupDetailResponse response = popupQueryService.getPopupDetail(1L);

        assertThat(response.getTitle()).isEqualTo("팝업 제목");
    }
}
