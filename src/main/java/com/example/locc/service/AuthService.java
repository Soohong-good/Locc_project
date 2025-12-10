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

        // 사용자 생성 (승인 대기 상태로)
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
                .role(User.Role.USER)
                .approvalStatus(User.ApprovalStatus.PENDING) // 승인 대기
                .enabled(false) // 승인 전에는 로그인 불가
                .build();

        userRepository.save(user);
        
        log.info("User registered successfully (pending approval): {}", user.getEmail());

        // 가입 신청 완료 응답 (토큰 없이)
        return AuthResponse.builder()
                .message("회원가입 신청이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다.")
                .build();
    }

    /**
     * 로그인
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("User login attempt: {}", request.getEmail());

        // 인증 (비밀번호 검증)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = (User) authentication.getPrincipal();

        // 인증 성공 후 계정 상태 체크
        // 삭제된 계정
        if (Boolean.TRUE.equals(user.getDeleted())) {
            throw new com.example.locc.exception.AccountDeletedException(
                    "삭제된 계정입니다. 관리자에게 문의해주세요.");
        }

        // 승인 대기 중
        if (user.getApprovalStatus() == User.ApprovalStatus.PENDING) {
            throw new com.example.locc.exception.AccountNotApprovedException(
                    "회원가입 승인 대기 중입니다. 관리자 승인 후 로그인이 가능합니다.",
                    "PENDING"
            );
        }

        // 가입 반려
        if (user.getApprovalStatus() == User.ApprovalStatus.REJECTED) {
            String message = "회원가입이 반려되었습니다.";
            if (user.getRejectionReason() != null && !user.getRejectionReason().isEmpty()) {
                message += "\n사유: " + user.getRejectionReason();
            }
            throw new com.example.locc.exception.AccountNotApprovedException(message, "REJECTED");
        }

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

    /**
     * 이메일 사용 가능 여부 체크
     */
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email);
    }

    /**
     * 현재 로그인한 사용자 정보 조회
     */
    @Transactional(readOnly = true)
    public UserInfoResponse getUserInfo(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return UserInfoResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .gender(user.getGender())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole().name())
                .userType(user.getUserType().name())
                .address(user.getAddress())
                .birth(user.getBirth())
                .registrationPath(user.getRegistrationPath())
                .build();
    }
}