package com.example.locc.security;

import com.example.locc.domain.user.entity.User;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        try {
            String jwt = extractJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && SecurityContextHolder.getContext().getAuthentication() == null) {
                String username = jwtTokenProvider.extractUsername(jwt);

                if (username != null && !jwtTokenProvider.isTokenExpired(jwt)) {
                    // JWT에서 권한 정보 추출
                    Claims claims = jwtTokenProvider.extractAllClaims(jwt);
                    List<String> authorities = claims.get("authorities", List.class);
                    
                    // DB 조회 없이 UserDetails 생성
                    UserDetails userDetails;
                    if (authorities != null && !authorities.isEmpty()) {
                        // JWT에 권한 정보가 있으면 그것 사용 (DB 조회 X)
                        userDetails = org.springframework.security.core.userdetails.User.builder()
                                .username(username)
                                .password("") // 비밀번호는 불필요
                                .authorities(authorities.stream()
                                        .map(SimpleGrantedAuthority::new)
                                        .collect(Collectors.toList()))
                                .build();
                    } else {
                        // 권한 정보가 없으면 DB 조회 (하위 호환성)
                        userDetails = userDetailsService.loadUserByUsername(username);
                    }

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    log.debug("Authenticated user: {}, authorities: {}",
                            username, userDetails.getAuthorities());
                }
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Request에서 JWT 토큰 추출
     * Authorization 헤더 또는 쿠키에서 추출
     */
    private String extractJwtFromRequest(HttpServletRequest request) {
        // 1. Authorization 헤더에서 추출 (API 요청용)
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        // 2. 쿠키에서 추출 (브라우저 페이지 요청용)
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("accessToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        return null;
    }
}