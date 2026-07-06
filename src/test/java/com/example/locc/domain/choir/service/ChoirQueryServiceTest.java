package com.example.locc.domain.choir.service;

import com.example.locc.domain.choir.dto.response.ChoirVideoResponse;
import com.example.locc.domain.choir.entity.ChoirVideo;
import com.example.locc.domain.choir.repository.ChoirVideoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;

/**
 * ChoirQueryService 단위 테스트 (Mockito, DB 불필요)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ChoirQueryService 단위 테스트")
class ChoirQueryServiceTest {

    @Mock private ChoirVideoRepository choirVideoRepository;

    @InjectMocks private ChoirQueryService choirQueryService;

    private ChoirVideo newVideo() {
        return ChoirVideo.create("찬양 영상", "https://youtube.com/watch?v=abc", "thumb.jpg",
                "abc", LocalDate.of(2026, 1, 1), "시온찬양대");
    }

    @Test
    @DisplayName("찬양대명이 없으면 전체 목록 조회로 라우팅한다")
    void findList_withoutChoirName_routesToAll() {
        Page<ChoirVideo> page = new PageImpl<>(List.of(newVideo()));
        given(choirVideoRepository.findAllByOrderByPublishedAtDesc(any())).willReturn(page);

        Page<ChoirVideoResponse> result = choirQueryService.findList(PageRequest.of(0, 10), null);

        assertThat(result.getContent()).hasSize(1);
        verify(choirVideoRepository, never()).findByChoirNameOrderByPublishedAtDesc(any(), any());
    }

    @Test
    @DisplayName("찬양대명이 있으면 찬양대별 조회로 라우팅한다")
    void findList_withChoirName_routesToFiltered() {
        Page<ChoirVideo> page = new PageImpl<>(List.of(newVideo()));
        given(choirVideoRepository.findByChoirNameOrderByPublishedAtDesc(eq("시온찬양대"), any())).willReturn(page);

        Page<ChoirVideoResponse> result = choirQueryService.findList(PageRequest.of(0, 10), "시온찬양대");

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getChoirName()).isEqualTo("시온찬양대");
    }
}
