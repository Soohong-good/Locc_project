package com.example.locc.domain.user.service;

import com.example.locc.domain.user.dto.command.UserLoginCommand;
import com.example.locc.domain.user.dto.command.UserRegisterCommand;
import com.example.locc.domain.user.dto.response.UserAuthResponse;
import com.example.locc.domain.user.entity.RefreshToken;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.RefreshTokenRepository;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.exception.AccountDeletedException;
import com.example.locc.exception.AccountNotApprovedException;
import com.example.locc.exception.TokenRefreshException;
import com.example.locc.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * User 명령 전용 서비스
 * - CUD 작업 처리
 * - 인증/인가 처리 (AuthService 통합)
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserCommandService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserQueryService userQueryService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    /**
     * 회원가입 (승인 대기 상태로)
     */
    public UserAuthResponse register(UserRegisterCommand command) {
        log.info("Registering new user: {}", command.getEmail());

        // 중복 체크
        if (userRepository.existsByEmail(command.getEmail())) {
            throw new IllegalArgumentException("이미 사용중인 이메일입니다.");
        }

        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(command.getPassword());

        // 사용자 생성 (팩토리 메서드 사용)
        User user = User.register(command, encodedPassword);
        userRepository.save(user);

        log.info("User registered successfully (pending approval): {}", user.getEmail());

        // 가입 신청 완료 응답 (토큰 없이)
        return UserAuthResponse.builder()
                .message("회원가입 신청이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다.")
                .build();
    }

    /**
     * 로그인
     */
    public UserAuthResponse login(UserLoginCommand command) {
        log.info("User login attempt: {}", command.getEmail());

        // 인증 (비밀번호 검증)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        command.getEmail(),
                        command.getPassword()
                )
        );

        User user = (User) authentication.getPrincipal();

        // 계정 상태 체크
        validateAccountStatus(user);

        // JWT 토큰 생성
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        // RefreshToken 저장 또는 갱신
        saveOrUpdateRefreshToken(user, refreshToken);

        log.info("User logged in successfully: {}", user.getEmail());

        return UserAuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtExpiration)
                .username(user.getName())
                .role(user.getRole().name())
                .message("로그인에 성공했습니다.")
                .build();
    }

    /**
     * 로그아웃
     */
    public void logout(String email) {
        log.info("User logout: {}", email);

        User user = userQueryService.findByEmail(email);
        refreshTokenRepository.deleteByUser(user);

        log.info("User logged out successfully: {}", email);
    }

    /**
     * 토큰 갱신
     */
    public UserAuthResponse refreshToken(String refreshTokenValue) {
        log.debug("Refreshing token");

        // RefreshToken 검증
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> new TokenRefreshException(
                        refreshTokenValue,
                        "유효하지 않은 RefreshToken입니다."
                ));

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new TokenRefreshException(
                    refreshTokenValue,
                    "RefreshToken이 만료되었습니다. 다시 로그인해주세요."
            );
        }

        // 새 AccessToken 생성
        User user = refreshToken.getUser();
        String newAccessToken = jwtTokenProvider.generateAccessToken(user);

        log.debug("Token refreshed successfully for user: {}", user.getEmail());

        return UserAuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshTokenValue)  // 기존 RefreshToken 유지
                .tokenType("Bearer")
                .expiresIn(jwtExpiration)
                .username(user.getName())
                .role(user.getRole().name())
                .build();
    }

    /**
     * 회원 승인
     */
    public void approve(UUID userId) {
        log.info("Approving user: {}", userId);

        User user = userQueryService.findById(userId);

        if (user.getApprovalStatus() != User.ApprovalStatus.PENDING) {
            throw new IllegalStateException("승인 대기 상태가 아닙니다.");
        }

        user.approve();
        log.info("User approved: {}", user.getEmail());
    }

    /**
     * 회원 반려
     */
    public void reject(UUID userId, String reason) {
        log.info("Rejecting user: {} - Reason: {}", userId, reason);

        User user = userQueryService.findById(userId);

        if (user.getApprovalStatus() != User.ApprovalStatus.PENDING) {
            throw new IllegalStateException("승인 대기 상태가 아닙니다.");
        }

        user.reject(reason);
        log.info("User rejected: {}", user.getEmail());
    }

    /**
     * 회원 삭제 (논리적 삭제)
     */
    public void delete(UUID userId) {
        log.info("Deleting user: {}", userId);

        User user = userQueryService.findById(userId);
        user.delete();

        // RefreshToken 삭제
        refreshTokenRepository.deleteByUser(user);

        log.info("User deleted: {}", user.getEmail());
    }

    /**
     * 회원 복구
     */
    public void restore(UUID userId) {
        log.info("Restoring user: {}", userId);

        User user = userQueryService.findById(userId);
        user.restore();

        log.info("User restored: {}", user.getEmail());
    }

    // ===== Private Helper Methods =====

    /**
     * 계정 상태 검증
     */
    private void validateAccountStatus(User user) {
        // 삭제된 계정
        if (user.isDeleted()) {
            throw new AccountDeletedException("삭제된 계정입니다. 관리자에게 문의해주세요.");
        }

        // 승인 대기 중
        if (user.getApprovalStatus() == User.ApprovalStatus.PENDING) {
            throw new AccountNotApprovedException(
                    "회원가입 승인 대기 중입니다. 관리자 승인 후 로그인이 가능합니다.",
                    "PENDING"
            );
        }

        // 반려된 계정
        if (user.getApprovalStatus() == User.ApprovalStatus.REJECTED) {
            String message = "회원가입이 반려되었습니다.";
            if (user.getRejectionReason() != null) {
                message += " 사유: " + user.getRejectionReason();
            }
            throw new AccountNotApprovedException(message, "REJECTED");
        }
    }

    /**
     * RefreshToken 저장 또는 갱신
     */
    private void saveOrUpdateRefreshToken(User user, String token) {
        LocalDateTime expiresAt = LocalDateTime.now()
                .plusSeconds(refreshExpiration / 1000);

        refreshTokenRepository.findByUser(user)
                .ifPresentOrElse(
                        existingToken -> existingToken.refresh(token, expiresAt),
                        () -> {
                            RefreshToken newToken = RefreshToken.create(user, token, expiresAt);
                            refreshTokenRepository.save(newToken);
                        }
                );
    }
}