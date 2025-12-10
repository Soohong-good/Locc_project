package com.example.locc.service;

import com.example.locc.entity.User;
import com.example.locc.exception.AccountDeletedException;
import com.example.locc.exception.AccountNotApprovedException;
import com.example.locc.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.debug("Loading user by email: {}", email);

        // 모든 사용자 조회 (삭제된 사용자, 승인 대기 중인 사용자 포함)
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "등록되지 않은 이메일입니다. 이메일을 확인해주세요."));

        // 여기서는 사용자만 반환하고, 상태 체크는 하지 않습니다
        // Spring Security가 UserDetails의 isEnabled(), isAccountNonLocked() 등을 자동으로 체크합니다
        return user;
    }
}
