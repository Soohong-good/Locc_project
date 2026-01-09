//package com.example.locc.service;
//
//import com.example.locc.dto.SermonDto;
//import com.example.locc.entity.Sermon;
//import com.example.locc.entity.User;
//import com.example.locc.exception.SermonNotFoundException;
//import com.example.locc.repository.SermonRepository;
//import com.example.locc.repository.UserRepository;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageImpl;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.domain.Pageable;
//
//import java.time.LocalDateTime;
//import java.util.Arrays;
//import java.util.List;
//import java.util.Optional;
//
//import static org.assertj.core.api.Assertions.*;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.BDDMockito.given;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//@DisplayName("SermonService 테스트")
//class SermonServiceTest {
//
//    @Mock
//    private SermonRepository sermonRepository;
//
//    @Mock
//    private UserRepository userRepository;
//
//    @InjectMocks
//    private SermonService sermonService;
//
//    private User adminUser;
//    private User normalUser;
//    private Sermon testSermon;
//    private SermonDto testSermonDto;
//
//    @BeforeEach
//    void setUp() {
//        // 관리자 사용자
//        adminUser = User.builder()
//                .email("admin@test.com")
//                .name("관리자")
//                .gender("남")
//                .phoneNumber("010-1111-1111")
//                .userType(User.UserType.REGISTERED)
//                .role(User.Role.ADMIN)
//                .build();
//        adminUser.generateId();
//
//        // 일반 사용자
//        normalUser = User.builder()
//                .email("user@test.com")
//                .name("일반사용자")
//                .gender("여")
//                .phoneNumber("010-2222-2222")
//                .userType(User.UserType.REGISTERED)
//                .role(User.Role.USER)
//                .build();
//        normalUser.generateId();
//
//        // 테스트 설교
//        testSermon = Sermon.builder()
//                .id(1L)
//                .title("낮도 주의 것이요, 밤도 주의 것이라")
//                .scripture("시편 74:12-17")
//                .preacher("최신광 담임목사")
//                .content("설교 내용...")
//                .audioUrl("https://audio.url")
//                .videoUrl("https://video.url")
//                .sermonDate(LocalDateTime.now())
//                .createdBy(adminUser)
//                .build();
//        testSermon.setCreatedAt(LocalDateTime.now());
//        testSermon.setIsActive(true);
//
//        // DTO
//        testSermonDto = SermonDto.builder()
//                .title("새 설교")
//                .scripture("요한복음 3:16")
//                .preacher("담임목사")
//                .content("설교 내용")
//                .audioUrl("https://audio.url")
//                .sermonDate(LocalDateTime.now())
//                .build();
//    }
//
//    @Test
//    @DisplayName("최근 설교 목록 조회 - 제한 개수")
//    void getRecentSermons_WithLimit_Success() {
//        // given
//        List<Sermon> sermonList = Arrays.asList(testSermon);
//        given(sermonRepository.findByIsActiveTrueOrderBySermonDateDesc())
//                .willReturn(sermonList);
//
//        // when
//        List<SermonDto> result = sermonService.getRecentSermons(3);
//
//        // then
//        assertThat(result).hasSize(1);
//        assertThat(result.get(0).getTitle()).isEqualTo("낮도 주의 것이요, 밤도 주의 것이라");
//
//        verify(sermonRepository).findByIsActiveTrueOrderBySermonDateDesc();
//    }
//
//    @Test
//    @DisplayName("최근 설교 목록 조회 - 페이징")
//    void getRecentSermons_WithPaging_Success() {
//        // given
//        Pageable pageable = PageRequest.of(0, 10);
//        Page<Sermon> sermonPage = new PageImpl<>(Arrays.asList(testSermon));
//
//        given(sermonRepository.findByIsActiveTrueOrderBySermonDateDesc(pageable))
//                .willReturn(sermonPage);
//
//        // when
//        Page<SermonDto> result = sermonService.getRecentSermons(pageable);
//
//        // then
//        assertThat(result).isNotNull();
//        assertThat(result.getContent()).hasSize(1);
//        assertThat(result.getContent().get(0).getPreacher()).isEqualTo("최신광 담임목사");
//
//        verify(sermonRepository).findByIsActiveTrueOrderBySermonDateDesc(pageable);
//    }
//
//    @Test
//    @DisplayName("가장 최근 설교 조회")
//    void getLatestSermon_Success() {
//        // given
//        given(sermonRepository.findFirstByIsActiveTrueOrderBySermonDateDesc())
//                .willReturn(Optional.of(testSermon));
//
//        // when
//        SermonDto result = sermonService.getLatestSermon();
//
//        // then
//        assertThat(result).isNotNull();
//        assertThat(result.getTitle()).isEqualTo("낮도 주의 것이요, 밤도 주의 것이라");
//        assertThat(result.getScripture()).isEqualTo("시편 74:12-17");
//
//        verify(sermonRepository).findFirstByIsActiveTrueOrderBySermonDateDesc();
//    }
//
//    @Test
//    @DisplayName("가장 최근 설교 조회 - 설교 없음")
//    void getLatestSermon_NoSermon() {
//        // given
//        given(sermonRepository.findFirstByIsActiveTrueOrderBySermonDateDesc())
//                .willReturn(Optional.empty());
//
//        // when
//        SermonDto result = sermonService.getLatestSermon();
//
//        // then
//        assertThat(result).isNull();
//
//        verify(sermonRepository).findFirstByIsActiveTrueOrderBySermonDateDesc();
//    }
//
//    @Test
//    @DisplayName("ID로 설교 조회 성공")
//    void getSermonById_Success() {
//        // given
//        given(sermonRepository.findById(1L)).willReturn(Optional.of(testSermon));
//
//        // when
//        SermonDto result = sermonService.getSermonById(1L);
//
//        // then
//        assertThat(result).isNotNull();
//        assertThat(result.getId()).isEqualTo(1L);
//        assertThat(result.getAudioUrl()).isEqualTo("https://audio.url");
//
//        verify(sermonRepository).findById(1L);
//    }
//
//    @Test
//    @DisplayName("ID로 설교 조회 실패 - 존재하지 않는 ID")
//    void getSermonById_Fail_NotFound() {
//        // given
//        given(sermonRepository.findById(999L)).willReturn(Optional.empty());
//
//        // when & then
//        assertThatThrownBy(() -> sermonService.getSermonById(999L))
//                .isInstanceOf(SermonNotFoundException.class)
//                .hasMessageContaining("999");
//
//        verify(sermonRepository).findById(999L);
//    }
//
//    @Test
//    @DisplayName("설교자별 설교 목록 조회")
//    void getSermonsByPreacher_Success() {
//        // given
//        given(sermonRepository.findByPreacherAndIsActiveTrueOrderBySermonDateDesc("최신광 담임목사"))
//                .willReturn(Arrays.asList(testSermon));
//
//        // when
//        List<SermonDto> result = sermonService.getSermonsByPreacher("최신광 담임목사");
//
//        // then
//        assertThat(result).hasSize(1);
//        assertThat(result.get(0).getPreacher()).isEqualTo("최신광 담임목사");
//
//        verify(sermonRepository).findByPreacherAndIsActiveTrueOrderBySermonDateDesc("최신광 담임목사");
//    }
//
//    @Test
//    @DisplayName("설교 검색 성공")
//    void searchSermons_Success() {
//        // given
//        Pageable pageable = PageRequest.of(0, 10);
//        Page<Sermon> sermonPage = new PageImpl<>(Arrays.asList(testSermon));
//
//        given(sermonRepository.searchSermons("시편", pageable))
//                .willReturn(sermonPage);
//
//        // when
//        Page<SermonDto> result = sermonService.searchSermons("시편", pageable);
//
//        // then
//        assertThat(result).isNotNull();
//        assertThat(result.getContent()).hasSize(1);
//        assertThat(result.getContent().get(0).getScripture()).contains("시편");
//
//        verify(sermonRepository).searchSermons("시편", pageable);
//    }
//
//    @Test
//    @DisplayName("설교 생성 성공 - 관리자")
//    void createSermon_Success_ByAdmin() {
//        // given
//        given(userRepository.findByUsername("admin")).willReturn(Optional.of(adminUser));
//        given(sermonRepository.save(any(Sermon.class))).willReturn(testSermon);
//
//        // when
//        SermonDto result = sermonService.createSermon(testSermonDto, "admin");
//
//        // then
//        assertThat(result).isNotNull();
//        assertThat(result.getTitle()).isEqualTo("낮도 주의 것이요, 밤도 주의 것이라");
//
//        verify(userRepository).findByUsername("admin");
//        verify(sermonRepository).save(any(Sermon.class));
//    }
//
//    @Test
//    @DisplayName("설교 수정 성공 - 작성자 본인")
//    void updateSermon_Success_ByAuthor() {
//        // given
//        given(sermonRepository.findById(1L)).willReturn(Optional.of(testSermon));
//        given(userRepository.findByUsername("admin")).willReturn(Optional.of(adminUser));
//
//        SermonDto updateDto = SermonDto.builder()
//                .title("수정된 설교 제목")
//                .scripture("수정된 본문")
//                .preacher("최신광 담임목사")
//                .content("수정된 내용")
//                .sermonDate(LocalDateTime.now())
//                .build();
//
//        // when
//        SermonDto result = sermonService.updateSermon(1L, updateDto, "admin");
//
//        // then
//        assertThat(result).isNotNull();
//        assertThat(result.getTitle()).isEqualTo("수정된 설교 제목");
//
//        verify(sermonRepository).findById(1L);
//        verify(userRepository).findByUsername("admin");
//    }
//
//    @Test
//    @DisplayName("설교 수정 실패 - 권한 없음 (일반 사용자)")
//    void updateSermon_Fail_NoPermission() {
//        // given
//        given(sermonRepository.findById(1L)).willReturn(Optional.of(testSermon));
//        given(userRepository.findByUsername("user")).willReturn(Optional.of(normalUser));
//
//        SermonDto updateDto = SermonDto.builder()
//                .title("수정 시도")
//                .build();
//
//        // when & then
//        assertThatThrownBy(() -> sermonService.updateSermon(1L, updateDto, "user"))
//                .isInstanceOf(IllegalStateException.class)
//                .hasMessageContaining("권한이 없습니다");
//
//        verify(sermonRepository).findById(1L);
//        verify(userRepository).findByUsername("user");
//    }
//
//    @Test
//    @DisplayName("설교 수정 성공 - 관리자 권한")
//    void updateSermon_Success_ByAdmin() {
//        // given
//        User anotherAdmin = User.builder()
//                .id(3L)
//                .username("admin2")
//                .role(User.Role.ADMIN)
//                .build();
//
//        given(sermonRepository.findById(1L)).willReturn(Optional.of(testSermon));
//        given(userRepository.findByUsername("admin2")).willReturn(Optional.of(anotherAdmin));
//
//        SermonDto updateDto = SermonDto.builder()
//                .title("관리자가 수정")
//                .scripture("시편 74:12-17")
//                .preacher("최신광 담임목사")
//                .content("내용")
//                .sermonDate(LocalDateTime.now())
//                .build();
//
//        // when
//        SermonDto result = sermonService.updateSermon(1L, updateDto, "admin2");
//
//        // then
//        assertThat(result).isNotNull();
//        assertThat(result.getTitle()).isEqualTo("관리자가 수정");
//
//        verify(sermonRepository).findById(1L);
//        verify(userRepository).findByUsername("admin2");
//    }
//
//    @Test
//    @DisplayName("설교 삭제 성공 - 작성자 본인")
//    void deleteSermon_Success_ByAuthor() {
//        // given
//        given(sermonRepository.findById(1L)).willReturn(Optional.of(testSermon));
//        given(userRepository.findByUsername("admin")).willReturn(Optional.of(adminUser));
//
//        // when
//        sermonService.deleteSermon(1L, "admin");
//
//        // then
//        assertThat(testSermon.getIsActive()).isFalse();
//
//        verify(sermonRepository).findById(1L);
//        verify(userRepository).findByUsername("admin");
//    }
//
//    @Test
//    @DisplayName("설교 삭제 실패 - 권한 없음")
//    void deleteSermon_Fail_NoPermission() {
//        // given
//        given(sermonRepository.findById(1L)).willReturn(Optional.of(testSermon));
//        given(userRepository.findByUsername("user")).willReturn(Optional.of(normalUser));
//
//        // when & then
//        assertThatThrownBy(() -> sermonService.deleteSermon(1L, "user"))
//                .isInstanceOf(IllegalStateException.class)
//                .hasMessageContaining("권한이 없습니다");
//
//        verify(sermonRepository).findById(1L);
//        verify(userRepository).findByUsername("user");
//    }
//}