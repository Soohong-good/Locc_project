package com.example.locc.domain.user.service;

import com.example.locc.common.ErrorCode;
import com.example.locc.config.JwtProperties;
import com.example.locc.domain.auth.service.EmailVerificationService;
import com.example.locc.domain.user.dto.command.UserLoginCommand;
import com.example.locc.domain.user.dto.command.UserRegisterCommand;
import com.example.locc.domain.user.dto.response.UserAuthResponse;
import com.example.locc.domain.user.entity.RefreshToken;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.RefreshTokenRepository;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.exception.AccountDeletedException;
import com.example.locc.exception.AccountNotApprovedException;
import com.example.locc.exception.InvalidInputException;
import com.example.locc.exception.TokenRefreshException;
import com.example.locc.security.TotpService;
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
    private final EmailVerificationService emailVerificationService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final JwtProperties jwtProperties;
    private final TotpService totpService;

    /**
     * 회원가입 (승인 대기 상태로)
     */
    public UserAuthResponse register(UserRegisterCommand command) {
        log.debug("Registering new user");

        // 이메일 중복 체크
        if (userRepository.existsByEmail(command.getEmail())) {
            throw new IllegalArgumentException("이미 사용중인 이메일입니다.");
        }

        // 서버가 발급한 이메일 인증 완료 여부 확인 (1회용 소비)
        if (!emailVerificationService.consumeVerification(command.getEmail())) {
            throw new InvalidInputException("이메일 인증을 먼저 완료해주세요.");
        }

        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(command.getPassword());

        // 사용자 생성 (팩토리 메서드 사용)
        User user = User.register(command, encodedPassword);
        user.verifyEmail(); // 인증 완료가 서버에서 확인됐으므로 처리
        userRepository.save(user);

        log.debug("User registered successfully (pending approval)");

        return UserAuthResponse.builder()
                .message("회원가입 신청이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다.")
                .build();
    }

    /**
     * 로그인
     */
    public UserAuthResponse login(UserLoginCommand command) {
        log.debug("User login attempt");

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

        // ADMIN — TOTP 활성화 여부에 따라 분기 (JWT 발급 보류)
        if (user.isAdmin()) {
            String preAuthToken = jwtTokenProvider.generatePreAuthToken(user.getEmail());
            if (Boolean.TRUE.equals(user.getTotpEnabled())) {
                return UserAuthResponse.builder()
                        .totpRequired(true)
                        .preAuthToken(preAuthToken)
                        .message("2차 인증이 필요합니다.")
                        .build();
            } else {
                return UserAuthResponse.builder()
                        .totpSetupRequired(true)
                        .preAuthToken(preAuthToken)
                        .message("2차 인증 설정이 필요합니다.")
                        .build();
            }
        }

        // JWT 토큰 생성
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        // RefreshToken 저장 또는 갱신
        saveOrUpdateRefreshToken(user, refreshToken);

        log.info("User logged in successfully");

        return UserAuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtProperties.getExpiration())
                .username(user.getName())
                .role(user.getRole().name())
                .message("로그인에 성공했습니다.")
                .build();
    }

    /**
     * 로그아웃
     */
    public void logout(String email) {
        log.debug("User logout");

        User user = userQueryService.findByEmail(email);
        refreshTokenRepository.deleteByUser(user);

        log.debug("User logged out successfully");
    }

    /**
     * 토큰 갱신 (Refresh Token Rotation)
     *
     * Rotation 적용 이유:
     *   - 기존 RT를 재사용하면 탈취된 RT로 무기한 갱신 가능
     *   - 매 갱신마다 새 RT를 발급하면 탈취된 RT는 한 번 사용 후 무효화
     *   - DB에 저장된 RT와 다른 값이 들어오면 탈취 감지 가능
     *
     * 반환값: 새 AccessToken + 새 RefreshToken (둘 다 쿠키로 재설정 필요)
     */
    public UserAuthResponse refreshToken(String refreshTokenValue) {
        log.debug("Refreshing token");

        // RefreshToken 검증
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> new TokenRefreshException(
                        refreshTokenValue,
                        ErrorCode.TOKEN_EXPIRED.getDefaultMessage()
                ));

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new TokenRefreshException(
                    refreshTokenValue,
                    ErrorCode.TOKEN_EXPIRED.getDefaultMessage()
            );
        }

        User user = refreshToken.getUser();

        // 계정 상태 검증 — PENDING/비활성/삭제 계정은 토큰 갱신 차단
        validateAccountStatus(user);

        // 새 AccessToken + 새 RefreshToken 발급 (Rotation)
        String newAccessToken  = jwtTokenProvider.generateAccessToken(user);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user);

        // DB의 RefreshToken 교체
        LocalDateTime newExpiresAt = LocalDateTime.now()
                .plusSeconds(jwtProperties.getRefreshExpiration() / 1000);
        refreshToken.refresh(newRefreshToken, newExpiresAt);

        log.debug("Token rotated successfully");

        return UserAuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)  // 새 RefreshToken 반환
                .tokenType("Bearer")
                .expiresIn(jwtProperties.getExpiration())
                .username(user.getName())
                .role(user.getRole().name())
                .build();
    }

    /**
     * 운영자 권한 부여 (총관리자 전용)
     */
    public void grantOperator(UUID userId) {
        log.info("Granting operator role: {}", userId);
        User user = userQueryService.findById(userId);
        if (user.getRole() == User.Role.ADMIN) {
            throw new IllegalStateException("총관리자 계정의 권한은 변경할 수 없습니다.");
        }
        user.grantOperator();
        log.info("Operator role granted: {}", userId);
    }

    /**
     * 운영자 권한 회수 (총관리자 전용)
     */
    public void revokeOperator(UUID userId) {
        log.info("Revoking operator role: {}", userId);
        User user = userQueryService.findById(userId);
        if (user.getRole() == User.Role.ADMIN) {
            throw new IllegalStateException("총관리자 계정의 권한은 변경할 수 없습니다.");
        }
        user.revokeOperator();
        log.info("Operator role revoked: {}", userId);
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
        log.info("User approved: {}", userId);
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
        log.info("User rejected: {}", userId);
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

        log.info("User deleted: {}", userId);
    }

    /**
     * 회원 복구
     */
    public void restore(UUID userId) {
        log.info("Restoring user: {}", userId);

        User user = userQueryService.findById(userId);
        user.restore();

        log.info("User restored: {}", userId);
    }

    /**
     * 회원 차단 (비활성화)
     * - 승인 대기(PENDING) 상태인 회원을 차단하면 승인 거부(REJECTED)로도 처리
     *   → 승인 대기 목록에서 자동으로 제거됨
     */
    public void disable(UUID userId) {
        log.info("Disabling user: {}", userId);

        User user = userQueryService.findById(userId);

        // PENDING 상태 회원을 차단하면 승인 대기 목록에서 제거
        if (user.getApprovalStatus() == User.ApprovalStatus.PENDING) {
            user.reject(null);
            log.info("Pending user rejected due to block: {}", userId);
        }

        user.disable();

        // RefreshToken 삭제 (재로그인 방지)
        refreshTokenRepository.deleteByUser(user);

        log.info("User disabled: {}", userId);
    }

    /**
     * 회원 차단 해제 (활성화)
     */
    public void enable(UUID userId) {
        log.info("Enabling user: {}", userId);

        User user = userQueryService.findById(userId);
        user.enable();

        log.info("User enabled: {}", userId);
    }

    // ===== Private Helper Methods =====

    /**
     * 계정 상태 검증
     */
    private void validateAccountStatus(User user) {
        // 삭제된 계정
        if (user.isDeleted()) {
            throw new AccountDeletedException(ErrorCode.ACCOUNT_DELETED.getDefaultMessage());
        }

        // 승인 대기 중
        if (user.getApprovalStatus() == User.ApprovalStatus.PENDING) {
            throw new AccountNotApprovedException(
                    ErrorCode.ACCOUNT_NOT_APPROVED.getDefaultMessage(),
                    "PENDING"
            );
        }

        // 반려된 계정
        if (user.getApprovalStatus() == User.ApprovalStatus.REJECTED) {
            throw new AccountNotApprovedException(
                    ErrorCode.ACCOUNT_NOT_APPROVED.getDefaultMessage(),
                    "REJECTED"
            );
        }

        // 관리자에 의해 비활성화된 계정
        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new org.springframework.security.authentication.DisabledException(
                    ErrorCode.ACCOUNT_DISABLED.getDefaultMessage()
            );
        }
    }

    /**
     * TOTP QR 코드 발급 (preAuthToken 기반 — 로그인 흐름 중)
     */
    public String setupTotp(String preAuthToken) {
        String email = jwtTokenProvider.getEmailFromPreAuthToken(preAuthToken);
        User user = userQueryService.findByEmail(email);
        String secret = totpService.generateSecret();
        user.setupTotp(secret);
        return totpService.generateQrCodeImageUri(secret, email);
    }

    /**
     * TOTP 활성화 + JWT 발급 (첫 코드 검증 후)
     */
    public User enableTotpAndGetUser(String preAuthToken, String code) {
        String email = jwtTokenProvider.getEmailFromPreAuthToken(preAuthToken);
        User user = userQueryService.findByEmail(email);
        if (user.getTotpSecret() == null) {
            throw new InvalidInputException("QR 코드를 먼저 발급받으세요.");
        }
        if (!totpService.verifyCode(user.getTotpSecret(), code)) {
            throw new InvalidInputException("인증 코드가 올바르지 않습니다.");
        }
        user.enableTotp();
        return user;
    }

    /**
     * TOTP 코드 검증 후 사용자 반환
     */
    public User verifyTotpAndGetUser(String preAuthToken, String code) {
        String email = jwtTokenProvider.getEmailFromPreAuthToken(preAuthToken);
        User user = userQueryService.findByEmail(email);
        if (!totpService.verifyCode(user.getTotpSecret(), code)) {
            throw new InvalidInputException("인증 코드가 올바르지 않습니다.");
        }
        return user;
    }

    /**
     * RefreshToken 저장 또는 갱신 (TOTP 컨트롤러에서 호출)
     */
    public void saveOrUpdateRefreshTokenPublic(User user, String token) {
        saveOrUpdateRefreshToken(user, token);
    }

    /**
     * RefreshToken 저장 또는 갱신
     */
    private void saveOrUpdateRefreshToken(User user, String token) {
        LocalDateTime expiresAt = LocalDateTime.now()
                .plusSeconds(jwtProperties.getRefreshExpiration() / 1000);

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