package com.example.locc.domain.bulletin.service;

import com.example.locc.domain.bulletin.dto.command.BulletinCreateCommand;
import com.example.locc.domain.bulletin.dto.response.BulletinDetailResponse;
import com.example.locc.domain.bulletin.dto.response.BulletinResponse;
import com.example.locc.domain.bulletin.entity.Bulletin;
import com.example.locc.domain.bulletin.repository.BulletinRepository;
import com.example.locc.domain.user.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

/**
 * BulletinQueryService 단위 테스트 (Mockito, DB 불필요)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("BulletinQueryService 단위 테스트")
class BulletinQueryServiceTest {

    @Mock private BulletinRepository bulletinRepository;

    @InjectMocks private BulletinQueryService bulletinQueryService;

    private Bulletin newBulletin() {
        User author = mock(User.class);
        given(author.getId()).willReturn(java.util.UUID.randomUUID());
        BulletinCreateCommand command = BulletinCreateCommand.builder()
                .title("제목").content("내용").build();
        return Bulletin.create(command, author);
    }

    @Test
    @DisplayName("주보 목록 조회 - repository 결과를 매핑해 반환한다")
    void getBulletins() {
        given(bulletinRepository.findList(any())).willReturn(Page.empty());

        Page<BulletinResponse> result = bulletinQueryService.getBulletins(PageRequest.of(0, 10));

        assertThat(result.getContent()).isEmpty();
    }

    @Test
    @DisplayName("주보 검색 - repository.search로 매핑해 반환한다")
    void searchBulletins() {
        given(bulletinRepository.search(eq("교회"), any())).willReturn(Page.empty());

        bulletinQueryService.searchBulletins("교회", PageRequest.of(0, 10));

        verify(bulletinRepository).search(eq("교회"), any());
    }

    @Test
    @DisplayName("목록 조회 - 키워드가 없으면 전체 조회로 라우팅한다")
    void getList_withoutKeyword_routesToAll() {
        given(bulletinRepository.findList(any())).willReturn(Page.empty());

        bulletinQueryService.getList(null, PageRequest.of(0, 10));

        verify(bulletinRepository).findList(any());
    }

    @Test
    @DisplayName("목록 조회 - 키워드가 있으면 검색으로 라우팅한다")
    void getList_withKeyword_routesToSearch() {
        given(bulletinRepository.search(eq("교회"), any())).willReturn(Page.empty());

        bulletinQueryService.getList("교회", PageRequest.of(0, 10));

        verify(bulletinRepository).search(eq("교회"), any());
    }

    @Test
    @DisplayName("주보 상세 조회 - 존재하지 않으면 IllegalArgumentException")
    void getBulletinDetail_notFound() {
        given(bulletinRepository.findDetailById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> bulletinQueryService.getBulletinDetail(1L))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("주보 상세 조회 - 정상 케이스면 상세 응답을 반환한다")
    void getBulletinDetail_success() {
        Bulletin bulletin = newBulletin();
        given(bulletinRepository.findDetailById(1L)).willReturn(Optional.of(bulletin));

        BulletinDetailResponse response = bulletinQueryService.getBulletinDetail(1L);

        assertThat(response.getTitle()).isEqualTo("제목");
    }
}
