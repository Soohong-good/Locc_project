package com.example.locc.domain.notice.service;

import com.example.locc.domain.file.service.FileQueryService;
import com.example.locc.domain.notice.dto.request.NoticeSearchCondition;
import com.example.locc.domain.notice.dto.response.NoticeResponse;
import com.example.locc.domain.notice.repository.NoticeRepository;
import com.example.locc.exception.NotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.BDDMockito.given;

/**
 * NoticeQueryService 단위 테스트 (Mockito, DB 불필요)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("NoticeQueryService 단위 테스트")
class NoticeQueryServiceTest {

    @Mock private NoticeRepository noticeRepository;
    @Mock private FileQueryService fileQueryService;

    @InjectMocks private NoticeQueryService noticeQueryService;

    @Test
    @DisplayName("공지 상세 - 존재하지 않는 ID면 NotFoundException")
    void findDetail_notFound() {
        given(noticeRepository.findDetailById(999L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> noticeQueryService.findDetail(999L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("공지 목록 - 키워드가 없으면 전체 목록을 조회한다 (빈 결과)")
    void findList_withoutKeyword_returnsEmpty() {
        NoticeSearchCondition condition = NoticeSearchCondition.builder().build();
        given(noticeRepository.findList(any())).willReturn(Page.empty());
        given(fileQueryService.countNoticeAttachments(anyList())).willReturn(Map.of());

        Page<NoticeResponse> result = noticeQueryService.findList(condition);

        assertThat(result.getContent()).isEmpty();
    }
}
