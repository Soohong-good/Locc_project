package com.example.locc.domain.user.service;

import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Spring Security UserDetailsService 구현
 * - 사용자 인증 시 호출됨
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.debug("Loading user by email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "등록되지 않은 이메일입니다. 이메일을 확인해주세요."));

        // 소셜 전용 계정(password=null)은 일반 로그인 불가
        if (user.getPassword() == null) {
            throw new BadCredentialsException(
                    "소셜 로그인으로 가입된 계정입니다. 카카오 또는 네이버로 로그인해주세요.");
        }

        return user;
    }
}
