package com.example.locc.domain.bibleschool.service;

import com.example.locc.domain.bibleschool.entity.BibleSchool;
import com.example.locc.domain.bibleschool.repository.BibleSchoolRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

/**
 * BibleSchoolQueryService 단위 테스트 (Mockito, DB 불필요)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("BibleSchoolQueryService 단위 테스트")
class BibleSchoolQueryServiceTest {

    @Mock private BibleSchoolRepository bibleSchoolRepository;

    @InjectMocks private BibleSchoolQueryService bibleSchoolQueryService;

    @Test
    @DisplayName("최신 조회 - 있으면 엔티티를 반환한다")
    void getLatest_found() {
        BibleSchool bibleSchool = BibleSchool.create("성경학교", "PL-1");
        given(bibleSchoolRepository.findFirstByOrderByIdDesc()).willReturn(Optional.of(bibleSchool));

        assertThat(bibleSchoolQueryService.getLatest()).isSameAs(bibleSchool);
    }

    @Test
    @DisplayName("최신 조회 - 없으면 null을 반환한다")
    void getLatest_notFound() {
        given(bibleSchoolRepository.findFirstByOrderByIdDesc()).willReturn(Optional.empty());

        assertThat(bibleSchoolQueryService.getLatest()).isNull();
    }
}
