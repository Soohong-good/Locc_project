//package com.example.locc.controller.api;
//
//import com.example.locc.dto.NoticeDto;
//import com.example.locc.dto.auth.LoginRequest;
//import com.example.locc.entity.User;
//import com.example.locc.repository.NoticeRepository;
//import com.example.locc.repository.UserRepository;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.http.MediaType;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.test.context.TestPropertySource;
//import org.springframework.test.web.servlet.MockMvc;
//import org.springframework.test.web.servlet.MvcResult;
//import org.springframework.transaction.annotation.Transactional;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
//
//@SpringBootTest
//@AutoConfigureMockMvc
//@Transactional
//@TestPropertySource(
//        locations = "classpath:application-test.yml",
//        properties = {
//                "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration"
//        }
//)
//@DisplayName("Notice API Integration 테스트")
//class NoticeApiIntegrationTest {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @Autowired
//    private ObjectMapper objectMapper;
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Autowired
//    private NoticeRepository noticeRepository;
//
//    @Autowired
//    private PasswordEncoder passwordEncoder;
//
//    private String adminToken;
//    private String userToken;
//
//    @BeforeEach
//    void setUp() throws Exception {
//        // 기존 데이터 정리
//        noticeRepository.deleteAll();
//        userRepository.deleteAll();
//
//        // 관리자 사용자 생성 및 로그인
//        User admin = User.builder()
//                .username("admin")
//                .password(passwordEncoder.encode("password123!"))
//                .email("admin@test.com")
//                .fullName("관리자")
//                .role(User.Role.ADMIN)
//                .build();
//        userRepository.save(admin);
//
//        LoginRequest adminLogin = LoginRequest.builder()
//                .username("admin")
//                .password("password123!")
//                .build();
//
//        MvcResult adminResult = mockMvc.perform(post("/api/auth/login")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(adminLogin)))
//                .andExpect(status().isOk())
//                .andReturn();
//
//        String adminResponse = adminResult.getResponse().getContentAsString();
//        adminToken = objectMapper.readTree(adminResponse).get("accessToken").asText();
//
//        // 일반 사용자 생성 및 로그인
//        User user = User.builder()
//                .username("user")
//                .password(passwordEncoder.encode("password123!"))
//                .email("user@test.com")
//                .fullName("사용자")
//                .role(User.Role.USER)
//                .build();
//        userRepository.save(user);
//
//        LoginRequest userLogin = LoginRequest.builder()
//                .username("user")
//                .password("password123!")
//                .build();
//
//        MvcResult userResult = mockMvc.perform(post("/api/auth/login")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(userLogin)))
//                .andExpect(status().isOk())
//                .andReturn();
//
//        String userResponse = userResult.getResponse().getContentAsString();
//        userToken = objectMapper.readTree(userResponse).get("accessToken").asText();
//    }
//
//    @Test
//    @DisplayName("공지사항 전체 조회 - 인증 없이 가능")
//    void getAllNotices_WithoutAuth_Success() throws Exception {
//        mockMvc.perform(get("/api/notices")
//                        .param("page", "0")
//                        .param("size", "10"))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.content").isArray());
//    }
//
//    @Test
//    @DisplayName("공지사항 생성 - 관리자만 가능")
//    void createNotice_AdminOnly_Success() throws Exception {
//        // given
//        NoticeDto noticeDto = NoticeDto.builder()
//                .title("새 공지사항")
//                .content("공지 내용")
//                .isPinned(false)
//                .build();
//
//        // when & then
//        mockMvc.perform(post("/api/notices")
//                        .header("Authorization", "Bearer " + adminToken)
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(noticeDto)))
//                .andExpect(status().isCreated())
//                .andExpect(jsonPath("$.title").value("새 공지사항"))
//                .andExpect(jsonPath("$.content").value("공지 내용"));
//
//        // DB에 저장되었는지 확인
//        assertThat(noticeRepository.findByIsActiveTrueOrderByIsPinnedDescCreatedAtDesc())
//                .hasSizeGreaterThanOrEqualTo(1);
//    }
//
//    @Test
//    @DisplayName("공지사항 생성 - 일반 사용자는 불가")
//    void createNotice_User_Forbidden() throws Exception {
//        // given
//        NoticeDto noticeDto = NoticeDto.builder()
//                .title("새 공지사항")
//                .content("공지 내용")
//                .build();
//
//        // when & then
//        mockMvc.perform(post("/api/notices")
//                        .header("Authorization", "Bearer " + userToken)
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(noticeDto)))
//                .andExpect(status().isForbidden());
//    }
//
//    @Test
//    @DisplayName("공지사항 생성 - 인증 없이 불가")
//    void createNotice_NoAuth_Unauthorized() throws Exception {
//        // given
//        NoticeDto noticeDto = NoticeDto.builder()
//                .title("새 공지사항")
//                .content("공지 내용")
//                .build();
//
//        // when & then
//        mockMvc.perform(post("/api/notices")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(noticeDto)))
//                .andExpect(status().isUnauthorized());
//    }
//
//    @Test
//    @DisplayName("공지사항 상세 조회 - 조회수 증가")
//    void getNoticeById_IncreasesViewCount() throws Exception {
//        // given - 공지사항 생성
//        NoticeDto noticeDto = NoticeDto.builder()
//                .title("조회수 테스트")
//                .content("내용")
//                .build();
//
//        MvcResult createResult = mockMvc.perform(post("/api/notices")
//                        .header("Authorization", "Bearer " + adminToken)
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(noticeDto)))
//                .andExpect(status().isCreated())
//                .andReturn();
//
//        String createResponse = createResult.getResponse().getContentAsString();
//        Long noticeId = objectMapper.readTree(createResponse).get("id").asLong();
//
//        // when - 첫 조회 (viewCount = 0)
//        mockMvc.perform(get("/api/notices/" + noticeId))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.title").value("조회수 테스트"))
//                .andExpect(jsonPath("$.viewCount").value(0));
//
//        // 조회수 증가 API 호출
//        mockMvc.perform(post("/api/notices/" + noticeId + "/view"))
//                .andExpect(status().isOk());
//
//        // then - 두 번째 조회 (viewCount = 1)
//        mockMvc.perform(get("/api/notices/" + noticeId))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.viewCount").value(1));
//    }
//
//    @Test
//    @DisplayName("공지사항 검색")
//    void searchNotices_Success() throws Exception {
//        // given - 여러 공지사항 생성
//        NoticeDto notice1 = NoticeDto.builder()
//                .title("자바 프로그래밍")
//                .content("내용1")
//                .build();
//
//        NoticeDto notice2 = NoticeDto.builder()
//                .title("스프링 부트")
//                .content("내용2")
//                .build();
//
//        mockMvc.perform(post("/api/notices")
//                        .header("Authorization", "Bearer " + adminToken)
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(notice1)))
//                .andExpect(status().isCreated());
//
//        mockMvc.perform(post("/api/notices")
//                        .header("Authorization", "Bearer " + adminToken)
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(notice2)))
//                .andExpect(status().isCreated());
//
//        // when & then
//        mockMvc.perform(get("/api/notices/search")
//                        .param("keyword", "자바")
//                        .param("page", "0")
//                        .param("size", "10"))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.content").isArray())
//                .andExpect(jsonPath("$.content[0].title").value("자바 프로그래밍"));
//    }
//
//    @Test
//    @DisplayName("공지사항 수정 - 작성자만 가능")
//    void updateNotice_OnlyAuthor_Success() throws Exception {
//        // given - 공지사항 생성
//        NoticeDto createDto = NoticeDto.builder()
//                .title("원본 제목")
//                .content("원본 내용")
//                .build();
//
//        MvcResult createResult = mockMvc.perform(post("/api/notices")
//                        .header("Authorization", "Bearer " + adminToken)
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(createDto)))
//                .andExpect(status().isCreated())
//                .andReturn();
//
//        String createResponse = createResult.getResponse().getContentAsString();
//        Long noticeId = objectMapper.readTree(createResponse).get("id").asLong();
//
//        // when - 수정
//        NoticeDto updateDto = NoticeDto.builder()
//                .title("수정된 제목")
//                .content("수정된 내용")
//                .build();
//
//        mockMvc.perform(put("/api/notices/" + noticeId)
//                        .header("Authorization", "Bearer " + adminToken)
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(updateDto)))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.title").value("수정된 제목"))
//                .andExpect(jsonPath("$.content").value("수정된 내용"));
//    }
//
//    @Test
//    @DisplayName("공지사항 삭제 - Soft Delete")
//    void deleteNotice_SoftDelete_Success() throws Exception {
//        // given - 공지사항 생성
//        NoticeDto noticeDto = NoticeDto.builder()
//                .title("삭제 테스트")
//                .content("내용")
//                .build();
//
//        MvcResult createResult = mockMvc.perform(post("/api/notices")
//                        .header("Authorization", "Bearer " + adminToken)
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(noticeDto)))
//                .andExpect(status().isCreated())
//                .andReturn();
//
//        String createResponse = createResult.getResponse().getContentAsString();
//        Long noticeId = objectMapper.readTree(createResponse).get("id").asLong();
//
//        // when - 삭제
//        mockMvc.perform(delete("/api/notices/" + noticeId)
//                        .header("Authorization", "Bearer " + adminToken))
//                .andExpect(status().isNoContent());
//
//        // then - 삭제 후 조회 시 NoticeNotFoundException 발생
//        // 하지만 DB에는 isActive=false로 존재
//        assertThat(noticeRepository.findById(noticeId))
//                .isPresent()
//                .hasValueSatisfying(notice ->
//                        assertThat(notice.getIsActive()).isFalse()
//                );
//
//        // 활성화된 공지사항 목록에는 나타나지 않음
//        assertThat(noticeRepository.findByIsActiveTrueOrderByIsPinnedDescCreatedAtDesc())
//                .noneMatch(notice -> notice.getId().equals(noticeId));
//    }
//}