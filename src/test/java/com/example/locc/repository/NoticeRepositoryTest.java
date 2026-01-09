//package com.example.locc.repository;
//
//import com.example.locc.entity.Notice;
//import com.example.locc.entity.User;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
//import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
//import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.domain.Pageable;
//import org.springframework.test.context.TestPropertySource;
//
//import java.util.List;
//
//import static org.assertj.core.api.Assertions.assertThat;
//
//@DataJpaTest
//@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
//@TestPropertySource(locations = "classpath:application-test.yml")
//@DisplayName("NoticeRepository 테스트")
//class NoticeRepositoryTest {
//
//    @Autowired
//    private TestEntityManager entityManager;
//
//    @Autowired
//    private NoticeRepository noticeRepository;
//
//    @Test
//    @DisplayName("공지사항 저장 및 조회")
//    void saveAndFind() {
//        // given
//        User user = createUser("testuser");
//        Notice notice = createNotice("테스트 공지", user, false);
//
//        // when
//        Notice saved = noticeRepository.save(notice);
//        Notice found = noticeRepository.findById(saved.getId()).orElse(null);
//
//        // then
//        assertThat(found).isNotNull();
//        assertThat(found.getTitle()).isEqualTo("테스트 공지");
//    }
//
//    @Test
//    @DisplayName("활성화된 공지사항만 조회")
//    void findActiveNotices() {
//        // given
//        User user = createUser("testuser");
//        Notice active = createNotice("활성 공지", user, false);
//        Notice inactive = createNotice("비활성 공지", user, false);
//        inactive.delete();
//
//        noticeRepository.save(active);
//        noticeRepository.save(inactive);
//        entityManager.flush();
//
//        // when
//        List<Notice> result = noticeRepository.findByIsActiveTrueOrderByIsPinnedDescCreatedAtDesc();
//
//        // then
//        assertThat(result).isNotEmpty();
//        assertThat(result).allMatch(Notice::getIsActive);
//    }
//
//    @Test
//    @DisplayName("고정 공지사항 조회")
//    void findPinnedNotices() {
//        // given
//        User user = createUser("testuser");
//        Notice pinned = createNotice("고정 공지", user, true);
//        Notice normal = createNotice("일반 공지", user, false);
//
//        noticeRepository.save(pinned);
//        noticeRepository.save(normal);
//        entityManager.flush();
//
//        // when
//        List<Notice> result = noticeRepository.findByIsPinnedTrueAndIsActiveTrue();
//
//        // then
//        assertThat(result).isNotEmpty();
//        assertThat(result).allMatch(Notice::getIsPinned);
//    }
//
//    @Test
//    @DisplayName("페이징 조회")
//    void findWithPaging() {
//        // given
//        User user = createUser("testuser");
//        for (int i = 0; i < 15; i++) {
//            noticeRepository.save(createNotice("공지 " + i, user, false));
//        }
//        entityManager.flush();
//
//        // when
//        Pageable pageable = PageRequest.of(0, 10);
//        Page<Notice> result = noticeRepository.findByIsActiveTrueOrderByIsPinnedDescCreatedAtDesc(pageable);
//
//        // then
//        assertThat(result.getContent()).hasSize(10);
//        assertThat(result.getTotalElements()).isGreaterThanOrEqualTo(15);
//    }
//
//    @Test
//    @DisplayName("제목으로 검색")
//    void searchByTitle() {
//        // given
//        User user = createUser("testuser");
//        noticeRepository.save(createNotice("Spring Boot 공지", user, false));
//        noticeRepository.save(createNotice("Java 공지", user, false));
//        entityManager.flush();
//
//        // when
//        Pageable pageable = PageRequest.of(0, 10);
//        Page<Notice> result = noticeRepository.searchNotices("Spring", pageable);
//
//        // then
//        assertThat(result.getContent()).isNotEmpty();
//        assertThat(result.getContent().get(0).getTitle()).contains("Spring");
//    }
//
//    @Test
//    @DisplayName("작성자로 조회")
//    void findByCreatedByUsername() {
//        // given
//        User user1 = createUser("kimuser");
//        User user2 = createUser("leeuser");
//        noticeRepository.save(createNotice("공지1", user1, false));
//        noticeRepository.save(createNotice("공지2", user2, false));
//        entityManager.flush();
//
//        // when
//        List<Notice> result = noticeRepository.findByCreatedByUsername("kimuser");
//
//        // then
//        assertThat(result).isNotEmpty();
//        assertThat(result).allMatch(n -> "kimuser".equals(n.getCreatedBy().getUsername()));
//    }
//
//    // Helper methods
//    private User createUser(String username) {
//        // username은 최소 4자 이상이어야 함
//        String validUsername = username.length() < 4 ? username + "user" : username;
//
//        User user = User.builder()
//                .username(validUsername)
//                .password("password123!")  // 최소 길이 충족
//                .email(validUsername + "@test.com")
//                .fullName("테스트 사용자")
//                .role(User.Role.ADMIN)
//                .build();
//        // BaseEntity 필드 초기화
//        user.setIsActive(true);
//        return entityManager.persist(user);
//    }
//
//    private Notice createNotice(String title, User user, boolean isPinned) {
//        Notice notice = Notice.builder()
//                .title(title)
//                .content("내용")
//                .createdBy(user)
//                .isPinned(isPinned)
//                .viewCount(0)
//                .build();
//        // BaseEntity 필드 초기화
//        notice.setIsActive(true);
//        return notice;
//    }
//}