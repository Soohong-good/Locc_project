package com.example.locc.domain.praisesheet.service;

import com.example.locc.domain.file.dto.response.AttachmentInfo;
import com.example.locc.domain.file.service.FileQueryService;
import com.example.locc.domain.praisesheet.dto.command.PraiseSheetCreateCommand;
import com.example.locc.domain.praisesheet.dto.request.PraiseSheetSearchCondition;
import com.example.locc.domain.praisesheet.dto.response.PraiseSheetDetailResponse;
import com.example.locc.domain.praisesheet.dto.response.PraiseSheetResponse;
import com.example.locc.domain.praisesheet.entity.PraiseSheet;
import com.example.locc.domain.praisesheet.repository.PraiseSheetRepository;
import com.example.locc.domain.user.entity.User;
import com.example.locc.exception.NotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

/**
 * PraiseSheetQueryService 단위 테스트 (Mockito, DB 불필요)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("PraiseSheetQueryService 단위 테스트")
class PraiseSheetQueryServiceTest {

    @Mock private PraiseSheetRepository praiseSheetRepository;
    @Mock private FileQueryService fileQueryService;

    @InjectMocks private PraiseSheetQueryService praiseSheetQueryService;

    private PraiseSheet newPraiseSheet() {
        User author = mock(User.class);
        given(author.getId()).willReturn(java.util.UUID.randomUUID());
        PraiseSheetCreateCommand command = PraiseSheetCreateCommand.builder()
                .title("제목").content("내용").build();
        PraiseSheet ps = PraiseSheet.create(command, author);
        ps.setCreatedAt(LocalDateTime.now());
        return ps;
    }

    @Test
    @DisplayName("목록 조회 - 키워드가 없으면 전체 조회로 라우팅한다")
    void findList_withoutKeyword_routesToAll() {
        PraiseSheetSearchCondition condition = PraiseSheetSearchCondition.builder().build();
        given(praiseSheetRepository.findList(any())).willReturn(Page.empty());
        given(fileQueryService.countPraiseSheetAttachments(anyList())).willReturn(Map.of());

        Page<PraiseSheetResponse> result = praiseSheetQueryService.findList(condition);

        assertThat(result.getContent()).isEmpty();
    }

    @Test
    @DisplayName("목록 조회 - 키워드가 있으면 검색(search)으로 라우팅한다")
    void findList_withKeyword_routesToSearch() {
        PraiseSheetSearchCondition condition = PraiseSheetSearchCondition.builder().keyword("찬양").build();
        given(praiseSheetRepository.search(eq("찬양"), any())).willReturn(Page.empty());
        given(fileQueryService.countPraiseSheetAttachments(anyList())).willReturn(Map.of());

        praiseSheetQueryService.findList(condition);

        verify(praiseSheetRepository).search(eq("찬양"), any());
    }

    @Test
    @DisplayName("목록 조회 - 첨부파일이 있는 항목은 hasAttachments가 true로 매핑된다")
    void findList_mapsHasAttachments() {
        PraiseSheet ps = newPraiseSheet();
        given(ps.getAuthor().getRole()).willReturn(User.Role.USER);
        PraiseSheetSearchCondition condition = PraiseSheetSearchCondition.builder().build();
        given(praiseSheetRepository.findList(any())).willReturn(new PageImpl<>(List.of(ps)));
        given(fileQueryService.countPraiseSheetAttachments(anyList())).willReturn(new java.util.HashMap<>());

        Page<PraiseSheetResponse> result = praiseSheetQueryService.findList(condition);

        assertThat(result.getContent().get(0).isHasAttachments()).isFalse();
    }

    @Test
    @DisplayName("상세 조회 - 존재하지 않으면 NotFoundException")
    void findDetail_notFound() {
        given(praiseSheetRepository.findDetailById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> praiseSheetQueryService.findDetail(1L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("상세 조회 - 정상 케이스면 첨부파일과 함께 상세 응답을 반환한다")
    void findDetail_success() {
        PraiseSheet ps = newPraiseSheet();
        given(praiseSheetRepository.findDetailById(1L)).willReturn(Optional.of(ps));
        given(fileQueryService.getPraiseSheetAttachments(1L))
                .willReturn(List.of(AttachmentInfo.builder().id(1L).originalFileName("악보.pdf").build()));

        PraiseSheetDetailResponse response = praiseSheetQueryService.findDetail(1L);

        assertThat(response.getTitle()).isEqualTo("제목");
        assertThat(response.getAttachments()).hasSize(1);
    }
}
