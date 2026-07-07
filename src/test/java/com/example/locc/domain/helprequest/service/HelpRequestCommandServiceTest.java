package com.example.locc.domain.helprequest.service;

import com.example.locc.domain.helprequest.dto.command.HelpRequestCreateCommand;
import com.example.locc.domain.helprequest.dto.command.UpdateAdminMemoCommand;
import com.example.locc.domain.helprequest.dto.command.UpdateHelpRequestStatusCommand;
import com.example.locc.domain.helprequest.dto.response.HelpRequestResponse;
import com.example.locc.domain.helprequest.entity.HelpRequest;
import com.example.locc.domain.helprequest.entity.HelpRequestStatus;
import com.example.locc.domain.helprequest.repository.HelpRequestRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

/**
 * HelpRequestCommandService 단위 테스트 (Mockito, DB 불필요)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("HelpRequestCommandService 단위 테스트")
class HelpRequestCommandServiceTest {

    @Mock private HelpRequestRepository helpRequestRepository;

    @InjectMocks private HelpRequestCommandService helpRequestCommandService;

    private HelpRequest newHelpRequest() {
        return HelpRequest.create("홍길동", "010-1234-5678", "hong@test.com", "상담 요청합니다");
    }

    @Test
    @DisplayName("도움 요청 생성 - 저장 후 응답을 반환한다")
    void create_success() {
        HelpRequestCreateCommand command = HelpRequestCreateCommand.builder()
                .name("홍길동").phone("010-1234-5678").email("hong@test.com").content("상담 요청합니다")
                .build();
        given(helpRequestRepository.save(any(HelpRequest.class)))
                .willAnswer(invocation -> invocation.getArgument(0));

        HelpRequestResponse response = helpRequestCommandService.create(command);

        assertThat(response.getName()).isEqualTo("홍길동");
    }

    @Test
    @DisplayName("상태 변경 - 존재하지 않으면 IllegalArgumentException")
    void updateStatus_notFound() {
        given(helpRequestRepository.findById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> helpRequestCommandService.updateStatus(1L,
                new UpdateHelpRequestStatusCommand(HelpRequestStatus.IN_PROGRESS)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("상태 변경 - 정상 케이스면 상태가 반영된다")
    void updateStatus_success() {
        HelpRequest helpRequest = newHelpRequest();
        given(helpRequestRepository.findById(1L)).willReturn(Optional.of(helpRequest));

        HelpRequestResponse response = helpRequestCommandService.updateStatus(1L,
                new UpdateHelpRequestStatusCommand(HelpRequestStatus.COMPLETED));

        assertThat(response.getStatus()).isEqualTo(HelpRequestStatus.COMPLETED);
    }

    @Test
    @DisplayName("관리자 메모 수정 - 존재하지 않으면 IllegalArgumentException")
    void updateAdminMemo_notFound() {
        given(helpRequestRepository.findById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> helpRequestCommandService.updateAdminMemo(1L,
                new UpdateAdminMemoCommand("확인했습니다")))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("관리자 메모 수정 - 정상 케이스면 메모가 반영된다")
    void updateAdminMemo_success() {
        HelpRequest helpRequest = newHelpRequest();
        given(helpRequestRepository.findById(1L)).willReturn(Optional.of(helpRequest));

        HelpRequestResponse response = helpRequestCommandService.updateAdminMemo(1L,
                new UpdateAdminMemoCommand("확인했습니다"));

        assertThat(response.getAdminMemo()).isEqualTo("확인했습니다");
    }

    @Test
    @DisplayName("삭제 - 존재하지 않으면 IllegalArgumentException")
    void delete_notFound() {
        given(helpRequestRepository.findById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> helpRequestCommandService.delete(1L))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("삭제 - 정상 케이스면 repository.delete가 호출된다")
    void delete_success() {
        HelpRequest helpRequest = newHelpRequest();
        given(helpRequestRepository.findById(1L)).willReturn(Optional.of(helpRequest));

        helpRequestCommandService.delete(1L);

        verify(helpRequestRepository).delete(helpRequest);
    }
}
