//package com.example.locc.service;
//
//import com.example.locc.dto.NoticeDto;
//import com.example.locc.entity.Notice;
//import com.example.locc.entity.User;
//import com.example.locc.exception.NoticeNotFoundException;
//import com.example.locc.repository.NoticeRepository;
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
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
//@DisplayName("NoticeService 테스트")
//class NoticeServiceTest {
//
//    @Mock
//    private NoticeRepository noticeRepository;
//
//    @Mock
//    private UserRepository userRepository;
//
//    @InjectMocks
//    private NoticeService noticeService;
//
//    private User adminUser;
//    private User normalUser;
//    private Notice testNotice;
//    private NoticeDto testNoticeDto;
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
//        // 테스트 공지사항
//        testNotice = Notice.builder()
//                .id(1L)
//                .title("테스트 공지사항")
//                .content("테스트 내용")
//                .createdBy(adminUser)
//                .viewCount(0)
//                .isPinned(false)
//                .build();
//        testNotice.setCreatedAt(LocalDateTime.now());
//        testNotice.setIsActive(true);
//
//        // DTO
//        testNoticeDto = NoticeDto.builder()
//                .title("새 공지사항")
//                .content("새 내용")
//                .isPinned(false)
//                .build();
//    }
//
//    @Test
//    @DisplayName("전체 공지사항 조회 성공")
//    void getAllNotices_Success() {
//        // given
//        Pageable pageable = PageRequest.of(0, 10);
//        List<Notice> noticeList = Arrays.asList(testNotice);
//        Page<Notice> noticePage = new PageImpl<>(noticeList, pageable, 1);
//
//        given(noticeRepository.findByIsActiveTrueOrderByIsPinnedDescCreatedAtDesc(pageable))
//                .willReturn(noticePage);
//
//        // when
//        Page<NoticeDto> result = noticeService.getAllNotices(pageable);
//
//        // then
//        assertThat(result).isNotNull();
//        assertThat(result.getContent()).hasSize(1);
//        assertThat(result.getContent().get(0).getTitle()).isEqualTo("테스트 공지사항");
//
//        verify(noticeRepository).findByIsActiveTrueOrderByIsPinnedDescCreatedAtDesc(pageable);
//    }
//
//    @Test
//    @DisplayName("ID로 공지사항 조회 성공")
//    void getNoticeById_Success() {
//        // given
//        given(noticeRepository.findById(1L)).willReturn(Optional.of(testNotice));
//
//        // when
//        NoticeDto result = noticeService.getNoticeById(1L);
//
//        // then
//        assertThat(result).isNotNull();
//        assertThat(result.getId()).isEqualTo(1L);
//        assertThat(result.getTitle()).isEqualTo("테스트 공지사항");
//
//        verify(noticeRepository).findById(1L);
//    }
//
//    @Test
//    @DisplayName("ID로 공지사항 조회 실패 - 존재하지 않는 ID")
//    void getNoticeById_Fail_NotFound() {
//        // given
//        given(noticeRepository.findById(999L)).willReturn(Optional.empty());
//
//        // when & then
//        assertThatThrownBy(() -> noticeService.getNoticeById(999L))
//                .isInstanceOf(NoticeNotFoundException.class)
//                .hasMessageContaining("999");
//
//        verify(noticeRepository).findById(999L);
//    }
//
//    @Test
//    @DisplayName("고정된 공지사항 조회")
//    void getPinnedNotices_Success() {
//        // given
//        Notice pinnedNotice = Notice.builder()
//                .id(2L)
//                .title("고정 공지")
//                .content("중요 공지")
//                .isPinned(true)
//                .build();
//
//        given(noticeRepository.findByIsPinnedTrueAndIsActiveTrue())
//                .willReturn(Arrays.asList(pinnedNotice));
//
//        // when
//        List<NoticeDto> result = noticeService.getPinnedNotices();
//
//        // then
//        assertThat(result).hasSize(1);
//        assertThat(result.get(0).getTitle()).isEqualTo("고정 공지");
//        assertThat(result.get(0).getIsPinned()).isTrue();
//
//        verify(noticeRepository).findByIsPinnedTrueAndIsActiveTrue();
//    }
//
//    @Test
//    @DisplayName("공지사항 검색 성공")
//    void searchNotices_Success() {
//        // given
//        Pageable pageable = PageRequest.of(0, 10);
//        Page<Notice> noticePage = new PageImpl<>(Arrays.asList(testNotice));
//
//        given(noticeRepository.searchNotices("테스트", pageable))
//                .willReturn(noticePage);
//
//        // when
//        Page<NoticeDto> result = noticeService.searchNotices("테스트", pageable);
//
//        // then
//        assertThat(result).isNotNull();
//        assertThat(result.getContent()).hasSize(1);
//        assertThat(result.getContent().get(0).getTitle()).contains("테스트");
//
//        verify(noticeRepository).searchNotices("테스트", pageable);
//    }
//
//    @Test
//    @DisplayName("조회수 증가 성공")
//    void increaseViewCount_Success() {
//        // given
//        given(noticeRepository.findById(1L)).willReturn(Optional.of(testNotice));
//
//        // when
//        noticeService.increaseViewCount(1L);
//
//        // then
//        assertThat(testNotice.getViewCount()).isEqualTo(1);
//        verify(noticeRepository).findById(1L);
//    }
//
//    @Test
//    @DisplayName("공지사항 생성 성공")
//    void createNotice_Success() {
//        // given
//        given(userRepository.findByEmail("admin@test.com")).willReturn(Optional.of(adminUser));
//        given(noticeRepository.save(any(Notice.class))).willReturn(testNotice);
//
//        // when
//        NoticeDto result = noticeService.createNotice(testNoticeDto, "admin@test.com");
//
//        // then
//        assertThat(result).isNotNull();
//        assertThat(result.getTitle()).isEqualTo("테스트 공지사항");
//
//        verify(userRepository).findByEmail("admin@test.com");
//        verify(noticeRepository).save(any(Notice.class));
//    }
//
//    @Test
//    @DisplayName("공지사항 생성 실패 - 존재하지 않는 사용자")
//    void createNotice_Fail_UserNotFound() {
//        // given
//        given(userRepository.findByEmail("unknown@test.com")).willReturn(Optional.empty());
//
//        // when & then
//        assertThatThrownBy(() -> noticeService.createNotice(testNoticeDto, "unknown@test.com"))
//                .isInstanceOf(UsernameNotFoundException.class)
//                .hasMessageContaining("사용자를 찾을 수 없습니다");
//
//        verify(userRepository).findByEmail("unknown@test.com");
//        verify(noticeRepository, never()).save(any());
//    }
//
//    @Test
//    @DisplayName("공지사항 수정 성공 - 작성자 본인")
//    void updateNotice_Success_ByAuthor() {
//        // given
//        given(noticeRepository.findById(1L)).willReturn(Optional.of(testNotice));
//        given(userRepository.findByEmail("admin@test.com")).willReturn(Optional.of(adminUser));
//
//        NoticeDto updateDto = NoticeDto.builder()
//                .title("수정된 제목")
//                .content("수정된 내용")
//                .build();
//
//        // when
//        NoticeDto result = noticeService.updateNotice(1L, updateDto, "admin@test.com");
//
//        // then
//        assertThat(result).isNotNull();
//        assertThat(result.getTitle()).isEqualTo("수정된 제목");
//        assertThat(result.getContent()).isEqualTo("수정된 내용");
//
//        verify(noticeRepository).findById(1L);
//        verify(userRepository).findByEmail("admin@test.com");
//    }
//
//    @Test
//    @DisplayName("공지사항 수정 실패 - 권한 없음")
//    void updateNotice_Fail_NoPermission() {
//        // given
//        given(noticeRepository.findById(1L)).willReturn(Optional.of(testNotice));
//        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(normalUser));
//
//        NoticeDto updateDto = NoticeDto.builder()
//                .title("수정된 제목")
//                .content("수정된 내용")
//                .build();
//
//        // when & then
//        assertThatThrownBy(() -> noticeService.updateNotice(1L, updateDto, "user@test.com"))
//                .isInstanceOf(IllegalStateException.class)
//                .hasMessageContaining("권한이 없습니다");
//
//        verify(noticeRepository).findById(1L);
//        verify(userRepository).findByEmail("user@test.com");
//    }
//
//    @Test
//    @DisplayName("공지사항 삭제 성공 - 작성자 본인")
//    void deleteNotice_Success_ByAuthor() {
//        // given
//        given(noticeRepository.findById(1L)).willReturn(Optional.of(testNotice));
//        given(userRepository.findByEmail("admin@test.com")).willReturn(Optional.of(adminUser));
//
//        // when
//        noticeService.deleteNotice(1L, "admin@test.com");
//
//        // then
//        assertThat(testNotice.getIsActive()).isFalse();
//
//        verify(noticeRepository).findById(1L);
//        verify(userRepository).findByEmail("admin@test.com");
//    }
//
//    @Test
//    @DisplayName("공지사항 삭제 실패 - 권한 없음")
//    void deleteNotice_Fail_NoPermission() {
//        // given
//        given(noticeRepository.findById(1L)).willReturn(Optional.of(testNotice));
//        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(normalUser));
//
//        // when & then
//        assertThatThrownBy(() -> noticeService.deleteNotice(1L, "user@test.com"))
//                .isInstanceOf(IllegalStateException.class)
//                .hasMessageContaining("권한이 없습니다");
//
//        verify(noticeRepository).findById(1L);
//        verify(userRepository).findByEmail("user@test.com");
//    }
//
//    @Test
//    @DisplayName("공지사항 삭제 성공 - 관리자 권한")
//    void deleteNotice_Success_ByAdmin() {
//        // given
//        User otherAdmin = User.builder()
//                .email("admin2@test.com")
//                .name("관리자2")
//                .gender("남")
//                .phoneNumber("010-3333-3333")
//                .userType(User.UserType.REGISTERED)
//                .role(User.Role.ADMIN)
//                .build();
//        otherAdmin.generateId();
//
//        given(noticeRepository.findById(1L)).willReturn(Optional.of(testNotice));
//        given(userRepository.findByEmail("admin2@test.com")).willReturn(Optional.of(otherAdmin));
//
//        // when
//        noticeService.deleteNotice(1L, "admin2@test.com");
//
//        // then
//        assertThat(testNotice.getIsActive()).isFalse();
//
//        verify(noticeRepository).findById(1L);
//        verify(userRepository).findByEmail("admin2@test.com");
//    }
//}