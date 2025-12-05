package com.example.locc.service;

import com.example.locc.dto.auth.*;
import com.example.locc.entity.RefreshToken;
import com.example.locc.entity.User;
import com.example.locc.exception.TokenRefreshException;
import com.example.locc.repository.RefreshTokenRepository;
import com.example.locc.repository.UserRepository;
import com.example.locc.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    /**
     * 회원가입
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user: {}", request.getEmail());

        // 중복 체크
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용중인 이메일입니다.");
        }

        // 미등록교인의 경우 추가 필드 검증
        if (request.getUserType() == User.UserType.UNREGISTERED) {
            if (request.getAddress() == null || request.getAddress().isBlank()) {
                throw new IllegalArgumentException("미등록교인은 주소가 필수입니다.");
            }
            if (request.getBirth() == null) {
                throw new IllegalArgumentException("미등록교인은 생년월일이 필수입니다.");
            }
            if (request.getRegistrationPath() == null || request.getRegistrationPath().isBlank()) {
                throw new IllegalArgumentException("미등록교인은 등록 경로가 필수입니다.");
            }
        }

        // 사용자 생성
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .gender(request.getGender())
                .phoneNumber(request.getPhoneNumber())
                .userType(request.getUserType())
                .address(request.getAddress())
                .birth(request.getBirth())
                .registrationPath(request.getRegistrationPath())
                .role(User.Role.USER) // 기본 권한
                .build();

        User savedUser = userRepository.save(user);

        // 토큰 생성
        String accessToken = jwtTokenProvider.generateAccessToken(savedUser);
        String refreshToken = jwtTokenProvider.generateRefreshToken(savedUser);

        // Refresh Token 저장
        saveToken(savedUser, refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.extractExpiration(accessToken).getTime())
                .username(savedUser.getEmail())
                .role(savedUser.getRole().name())
                .build();
    }

    /**
     * 로그인
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("User login attempt: {}", request.getEmail());

        // 인증
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = (User) authentication.getPrincipal();

        // 토큰 생성
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        // 기존 Refresh Token 삭제 후 새로 저장
        refreshTokenRepository.deleteByUser(user);
        saveToken(user, refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.extractExpiration(accessToken).getTime())
                .username(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    /**
     * 토큰 갱신
     */
    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenRepository.findByToken(requestRefreshToken)
                .map(this::verifyToken)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String newAccessToken = jwtTokenProvider.generateAccessToken(user);

                    return AuthResponse.builder()
                            .accessToken(newAccessToken)
                            .refreshToken(requestRefreshToken)
                            .tokenType("Bearer")
                            .expiresIn(jwtTokenProvider.extractExpiration(newAccessToken).getTime())
                            .username(user.getEmail())
                            .role(user.getRole().name())
                            .build();
                })
                .orElseThrow(() -> new TokenRefreshException(
                        requestRefreshToken, "Refresh token이 존재하지 않습니다."));
    }

    /**
     * 로그아웃
     */
    @Transactional
    public void logout(String email) {
        log.info("User logout: {}", email);

        userRepository.findByEmail(email)
                .ifPresent(refreshTokenRepository::deleteByUser);
    }

    /**
     * Refresh Token 저장
     */
    private void saveToken(User user, String token) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(token)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();

        refreshTokenRepository.save(refreshToken);
    }

    /**
     * Refresh Token 만료 확인
     */
    private RefreshToken verifyToken(RefreshToken token) {
        if (token.isExpired()) {
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException(
                    token.getToken(), "Refresh token이 만료되었습니다. 다시 로그인해주세요.");
        }
        return token;
    }

    /**
     * 만료된 Refresh Token 일괄 삭제 (스케줄러에서 호출)
     */
    @Transactional
    public void cleanExpired() {
        log.info("Deleting expired refresh tokens");
        refreshTokenRepository.deleteExpired(LocalDateTime.now());
    }
}