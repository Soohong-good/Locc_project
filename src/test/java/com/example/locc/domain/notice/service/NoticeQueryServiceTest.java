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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

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
    @DisplayName("내부 findById - 존재하지 않는 ID면 NotFoundException")
    void findById_notFound() {
        given(noticeRepository.findById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> noticeQueryService.findById(1L))
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

    @Test
    @DisplayName("공지 목록 - 키워드가 있으면 검색(search)으로 라우팅한다")
    void findList_withKeyword_routesToSearch() {
        NoticeSearchCondition condition = NoticeSearchCondition.builder().keyword("교회").build();
        given(noticeRepository.search(eq("교회"), any())).willReturn(Page.empty());
        given(fileQueryService.countNoticeAttachments(anyList())).willReturn(Map.of());

        noticeQueryService.findList(condition);

        verify(noticeRepository).search(eq("교회"), any());
    }

    @Test
    @DisplayName("최근 N일 공지 개수 - 레포지토리 카운트를 그대로 반환한다")
    void countRecent_returnsRepositoryCount() {
        given(noticeRepository.countByCreatedAtAfter(any())).willReturn(7L);

        assertThat(noticeQueryService.countRecent(30)).isEqualTo(7L);
    }
}
