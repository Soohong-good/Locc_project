//package com.example.locc.service;
//
//import com.example.locc.dto.auth.AuthResponse;
//import com.example.locc.dto.auth.LoginRequest;
//import com.example.locc.dto.auth.RegisterRequest;
//import com.example.locc.entity.RefreshToken;
//import com.example.locc.entity.User;
//import com.example.locc.exception.TokenRefreshException;
//import com.example.locc.repository.RefreshTokenRepository;
//import com.example.locc.repository.UserRepository;
//import com.example.locc.security.JwtTokenProvider;
//import com.example.locc.service.AuthService;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.authentication.BadCredentialsException;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.crypto.password.PasswordEncoder;
//
//import java.time.LocalDateTime;
//import java.util.Optional;
//
//import static org.assertj.core.api.Assertions.*;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.BDDMockito.given;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//@DisplayName("AuthService 테스트")
//class AuthServiceTest {
//
//    @Mock
//    private UserRepository userRepository;
//
//    @Mock
//    private RefreshTokenRepository refreshTokenRepository;
//
//    @Mock
//    private PasswordEncoder passwordEncoder;
//
//    @Mock
//    private JwtTokenProvider jwtTokenProvider;
//
//    @Mock
//    private AuthenticationManager authenticationManager;
//
//    @InjectMocks
//    private AuthService authService;
//
//    private RegisterRequest registerRequest;
//    private LoginRequest loginRequest;
//    private User testUser;
//
//    @BeforeEach
//    void setUp() {
//        // 회원가입 요청 데이터
//        registerRequest = RegisterRequest.builder()
//                .email("test@test.com")
//                .password("password123!")
//                .name("테스트 유저")
//                .gender("남")
//                .phoneNumber("010-1234-5678")
//                .userType(User.UserType.REGISTERED)
//                .build();
//
//        // 로그인 요청 데이터
//        loginRequest = LoginRequest.builder()
//                .email("test@test.com")
//                .password("password123!")
//                .build();
//
//        // 테스트 사용자
//        testUser = User.builder()
//                .email("test@test.com")
//                .password("encodedPassword")
//                .name("테스트 유저")
//                .gender("남")
//                .phoneNumber("010-1234-5678")
//                .userType(User.UserType.REGISTERED)
//                .role(User.Role.USER)
//                .build();
//        testUser.generateId(); // UUID 생성
//    }
//
//    @Test
//    @DisplayName("회원가입 성공")
//    void register_Success() {
//        // given
//        given(userRepository.existsByEmail("test@test.com")).willReturn(false);
//        given(passwordEncoder.encode("password123!")).willReturn("encodedPassword");
//        given(userRepository.save(any(User.class))).willReturn(testUser);
//        given(jwtTokenProvider.generateAccessToken(testUser)).willReturn("access-token");
//        given(jwtTokenProvider.generateRefreshToken(testUser)).willReturn("refresh-token");
//        given(jwtTokenProvider.extractExpiration("access-token")).willReturn(new java.util.Date(System.currentTimeMillis() + 86400000));
//
//        // when
//        AuthResponse response = authService.register(registerRequest);
//
//        // then
//        assertThat(response).isNotNull();
//        assertThat(response.getAccessToken()).isEqualTo("access-token");
//        assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
//        assertThat(response.getUsername()).isEqualTo("test@test.com");
//        assertThat(response.getRole()).isEqualTo("USER");
//        assertThat(response.getTokenType()).isEqualTo("Bearer");
//
//        verify(userRepository).existsByEmail("test@test.com");
//        verify(userRepository).save(any(User.class));
//        verify(refreshTokenRepository).save(any(RefreshToken.class));
//    }
//
//    @Test
//    @DisplayName("회원가입 실패 - 중복된 이메일")
//    void register_Fail_DuplicateEmail() {
//        // given
//        given(userRepository.existsByEmail("test@test.com")).willReturn(true);
//
//        // when & then
//        assertThatThrownBy(() -> authService.register(registerRequest))
//                .isInstanceOf(IllegalArgumentException.class)
//                .hasMessageContaining("이미 사용중인 이메일입니다");
//
//        verify(userRepository).existsByEmail("test@test.com");
//        verify(userRepository, never()).save(any(User.class));
//    }
//
//    @Test
//    @DisplayName("로그인 성공")
//    void login_Success() {
//        // given
//        Authentication authentication = mock(Authentication.class);
//        given(authentication.getPrincipal()).willReturn(testUser);
//        given(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
//                .willReturn(authentication);
//        given(jwtTokenProvider.generateAccessToken(testUser)).willReturn("access-token");
//        given(jwtTokenProvider.generateRefreshToken(testUser)).willReturn("refresh-token");
//        given(jwtTokenProvider.extractExpiration("access-token")).willReturn(new java.util.Date(System.currentTimeMillis() + 86400000));
//
//        // when
//        AuthResponse response = authService.login(loginRequest);
//
//        // then
//        assertThat(response).isNotNull();
//        assertThat(response.getAccessToken()).isEqualTo("access-token");
//        assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
//        assertThat(response.getUsername()).isEqualTo("test@test.com");
//        assertThat(response.getRole()).isEqualTo("USER");
//
//        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
//        verify(refreshTokenRepository).deleteByUser(testUser);
//        verify(refreshTokenRepository).save(any(RefreshToken.class));
//    }
//
//    @Test
//    @DisplayName("로그인 실패 - 잘못된 비밀번호")
//    void login_Fail_BadCredentials() {
//        // given
//        given(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
//                .willThrow(new BadCredentialsException("Bad credentials"));
//
//        // when & then
//        assertThatThrownBy(() -> authService.login(loginRequest))
//                .isInstanceOf(BadCredentialsException.class);
//
//        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
//        verify(refreshTokenRepository, never()).save(any(RefreshToken.class));
//    }
//
//    @Test
//    @DisplayName("로그아웃 성공")
//    void logout_Success() {
//        // given
//        given(userRepository.findByEmail("test@test.com")).willReturn(Optional.of(testUser));
//
//        // when
//        authService.logout("test@test.com");
//
//        // then
//        verify(userRepository).findByEmail("test@test.com");
//        verify(refreshTokenRepository).deleteByUser(testUser);
//    }
//
//    @Test
//    @DisplayName("토큰 갱신 성공")
//    void refreshToken_Success() {
//        // given
//        RefreshToken refreshToken = RefreshToken.builder()
//                .id(1L)
//                .token("refresh-token")
//                .user(testUser)
//                .expiresAt(LocalDateTime.now().plusDays(7))
//                .createdAt(LocalDateTime.now())
//                .build();
//
//        given(refreshTokenRepository.findByToken("refresh-token")).willReturn(Optional.of(refreshToken));
//        given(jwtTokenProvider.generateAccessToken(testUser)).willReturn("new-access-token");
//        given(jwtTokenProvider.extractExpiration("new-access-token")).willReturn(new java.util.Date(System.currentTimeMillis() + 86400000));
//
//        // when
//        com.example.locc.dto.auth.RefreshTokenRequest request = new com.example.locc.dto.auth.RefreshTokenRequest("refresh-token");
//        AuthResponse response = authService.refreshToken(request);
//
//        // then
//        assertThat(response).isNotNull();
//        assertThat(response.getAccessToken()).isEqualTo("new-access-token");
//        assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
//
//        verify(refreshTokenRepository).findByToken("refresh-token");
//        verify(jwtTokenProvider).generateAccessToken(testUser);
//    }
//
//    @Test
//    @DisplayName("토큰 갱신 실패 - 존재하지 않는 토큰")
//    void refreshToken_Fail_TokenNotFound() {
//        // given
//        given(refreshTokenRepository.findByToken("invalid-token")).willReturn(Optional.empty());
//
//        // when & then
//        com.example.locc.dto.auth.RefreshTokenRequest request = new com.example.locc.dto.auth.RefreshTokenRequest("invalid-token");
//        assertThatThrownBy(() -> authService.refreshToken(request))
//                .isInstanceOf(TokenRefreshException.class)
//                .hasMessageContaining("Refresh token이 존재하지 않습니다");
//
//        verify(refreshTokenRepository).findByToken("invalid-token");
//        verify(jwtTokenProvider, never()).generateAccessToken(any());
//    }
//
//    @Test
//    @DisplayName("토큰 갱신 실패 - 만료된 토큰")
//    void refreshToken_Fail_ExpiredToken() {
//        // given
//        RefreshToken expiredToken = RefreshToken.builder()
//                .id(1L)
//                .token("expired-token")
//                .user(testUser)
//                .expiresAt(LocalDateTime.now().minusDays(1))  // 만료됨
//                .createdAt(LocalDateTime.now().minusDays(8))
//                .build();
//
//        given(refreshTokenRepository.findByToken("expired-token")).willReturn(Optional.of(expiredToken));
//
//        // when & then
//        com.example.locc.dto.auth.RefreshTokenRequest request = new com.example.locc.dto.auth.RefreshTokenRequest("expired-token");
//        assertThatThrownBy(() -> authService.refreshToken(request))
//                .isInstanceOf(TokenRefreshException.class)
//                .hasMessageContaining("Refresh token이 만료되었습니다");
//
//        verify(refreshTokenRepository).findByToken("expired-token");
//        verify(refreshTokenRepository).delete(expiredToken);
//        verify(jwtTokenProvider, never()).generateAccessToken(any());
//    }
//
//    @Test
//    @DisplayName("미등록교인 회원가입 성공")
//    void register_UnregisteredUser_Success() {
//        // given
//        RegisterRequest unregisteredRequest = RegisterRequest.builder()
//                .email("unregistered@test.com")
//                .password("password123!")
//                .name("미등록 유저")
//                .gender("여")
//                .phoneNumber("010-9876-5432")
//                .userType(User.UserType.UNREGISTERED)
//                .address("서울시 강남구")
//                .birth(java.time.LocalDate.of(1990, 1, 1))
//                .registrationPath("친구 소개")
//                .build();
//
//        User unregisteredUser = User.builder()
//                .email("unregistered@test.com")
//                .password("encodedPassword")
//                .name("미등록 유저")
//                .gender("여")
//                .phoneNumber("010-9876-5432")
//                .userType(User.UserType.UNREGISTERED)
//                .address("서울시 강남구")
//                .birth(java.time.LocalDate.of(1990, 1, 1))
//                .registrationPath("친구 소개")
//                .role(User.Role.USER)
//                .build();
//        unregisteredUser.generateId();
//
//        given(userRepository.existsByEmail("unregistered@test.com")).willReturn(false);
//        given(passwordEncoder.encode("password123!")).willReturn("encodedPassword");
//        given(userRepository.save(any(User.class))).willReturn(unregisteredUser);
//        given(jwtTokenProvider.generateAccessToken(unregisteredUser)).willReturn("access-token");
//        given(jwtTokenProvider.generateRefreshToken(unregisteredUser)).willReturn("refresh-token");
//        given(jwtTokenProvider.extractExpiration("access-token")).willReturn(new java.util.Date(System.currentTimeMillis() + 86400000));
//
//        // when
//        AuthResponse response = authService.register(unregisteredRequest);
//
//        // then
//        assertThat(response).isNotNull();
//        assertThat(response.getAccessToken()).isEqualTo("access-token");
//        verify(userRepository).save(any(User.class));
//    }
//
//    @Test
//    @DisplayName("미등록교인 회원가입 실패 - 주소 누락")
//    void register_UnregisteredUser_Fail_MissingAddress() {
//        // given
//        RegisterRequest invalidRequest = RegisterRequest.builder()
//                .email("unregistered@test.com")
//                .password("password123!")
//                .name("미등록 유저")
//                .gender("여")
//                .phoneNumber("010-9876-5432")
//                .userType(User.UserType.UNREGISTERED)
//                // address 누락
//                .birth(java.time.LocalDate.of(1990, 1, 1))
//                .registrationPath("친구 소개")
//                .build();
//
//        given(userRepository.existsByEmail("unregistered@test.com")).willReturn(false);
//
//        // when & then
//        assertThatThrownBy(() -> authService.register(invalidRequest))
//                .isInstanceOf(IllegalArgumentException.class)
//                .hasMessageContaining("미등록교인은 주소가 필수입니다");
//
//        verify(userRepository, never()).save(any(User.class));
//    }
//}