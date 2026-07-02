package com.example.locc.config;

import com.example.locc.security.CustomOAuth2UserService;
import com.example.locc.security.CustomOAuth2AuthorizationRequestRepository;
import com.example.locc.security.JwtAuthenticationEntryPoint;
import com.example.locc.security.JwtAuthenticationFilter;
import com.example.locc.security.OAuth2FailureHandler;
import com.example.locc.security.OAuth2SuccessHandler;
import com.example.locc.security.RateLimitFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.ForwardedHeaderFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter     jwtAuthFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final UserDetailsService          userDetailsService;
    private final CustomOAuth2UserService     customOAuth2UserService;
    private final OAuth2SuccessHandler        oAuth2SuccessHandler;
    private final OAuth2FailureHandler        oAuth2FailureHandler;
    private final AppProperties               appProperties;
    private final RateLimitFilter             rateLimitFilter;
    private final CustomOAuth2AuthorizationRequestRepository customAuthorizationRequestRepository;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // ── 보안 응답 헤더 ─────────────────────────────────────────
                .headers(headers -> headers
                        // XSS 필터 활성화 (구형 브라우저 호환)
                        .xssProtection(xss -> xss.disable())   // CSP로 대체되므로 비활성화(1;mode=block은 deprecated)
                        // MIME 스니핑 방지 — Content-Type 강제 준수
                        .contentTypeOptions(opt -> {})
                        // Clickjacking 방지 — iframe 임베드 차단
                        .frameOptions(frame -> frame.deny())
                        // CSP — 허용 출처 명시로 인라인 스크립트 실행 제한
                        .contentSecurityPolicy(csp -> csp
                                .policyDirectives(
                                        "default-src 'self'; " +
                                        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com; " +
                                        "style-src 'self' 'unsafe-inline'; " +
                                        "img-src 'self' data: https:; " +
                                        "frame-src 'self' https://www.youtube.com; " +
                                        "connect-src 'self'; " +
                                        "font-src 'self' data:"
                                )
                        )
                )
                .csrf(csrf -> csrf
                        // /api/** CSRF 토큰 비활성화 근거:
                        // accessToken은 HttpOnly 쿠키로도 전달되므로 CSRF 벡터가 완전히 없는 것은 아니나,
                        // SameSite=Lax 쿠키 정책(CookieUtil)이 cross-site POST/PUT/DELETE에서 쿠키 전송을
                        // 차단하므로 상태 변경 요청에 대한 CSRF가 방어됨 (Lax는 top-level GET만 쿠키 허용)
                        .ignoringRequestMatchers("/api/**", "/login/oauth2/**", "/oauth2/**")
                )
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception ->
                        exception.authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(endpoint -> endpoint
                                .authorizationRequestRepository(customAuthorizationRequestRepository))
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService))
                        .successHandler(oAuth2SuccessHandler)
                        .failureHandler(oAuth2FailureHandler)
                )
                .authorizeHttpRequests(auth -> auth
                        // ========== Swagger UI / API Docs — ADMIN 전용 ==========
                        // 운영: application-prod.yml에서 springdoc 자체 비활성화 (404 반환)
                        // 개발: ADMIN 계정으로만 접근 가능
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html").hasRole("ADMIN")
                        .requestMatchers("/api-docs/**", "/api-docs").hasRole("ADMIN")

                        // ========== /uploads 직접 접근 차단 ==========
                        // 갤러리 이미지는 공개 콘텐츠이므로 직접 접근 허용
                        // 그 외 파일 접근은 /api/files/image/** 와 /api/files/download/** 로만 허용
                        .requestMatchers("/uploads/gallery/**").permitAll()
                        .requestMatchers("/uploads/staff/**").permitAll()
                        .requestMatchers("/uploads/**").denyAll()

                        // ========== 정적 리소스 ==========
                        .requestMatchers("/favicon.ico").permitAll()
                        .requestMatchers("/.well-known/**").permitAll()

                        // ========== 방문자 카운트 — 비로그인 포함 전체 허용 ==========
                        .requestMatchers(HttpMethod.POST, "/api/visitor/count").permitAll()

                        // ========== 관리자 전용 영역 ==========
                        // [SECURITY] facility-applications 규칙을 /api/admin/** 보다 먼저 선언해야
                        // OPERATOR 역할이 올바르게 적용됩니다. (더 구체적인 경로가 먼저 와야 함)
                        .requestMatchers("/api/admin/facility-applications/**").hasAnyRole("ADMIN", "OPERATOR")
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // ========== 주보 — 조회 로그인 필수, 쓰기는 authenticated (서비스에서 BULLETIN 권한 검증) ==========
                        .requestMatchers(HttpMethod.GET, "/api/bulletin/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/bulletin/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/bulletin/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/bulletin/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/bulletin/**").authenticated()

                        // ========== 마이페이지 — 로그인 필수 ==========
                        .requestMatchers("/api/mypage/**").authenticated()

                        // ========== 영역별 권한 조회 — 로그인 필수 ==========
                        .requestMatchers(HttpMethod.GET, "/api/users/me/permissions").authenticated()

                        // ========== 훈련 신청 — 로그인 필수 ==========
                        // [SECURITY] /api/applications/** 전체에 인증 필수 적용 (IDOR 방지)
                        .requestMatchers(HttpMethod.GET, "/api/applications/training/*/excel").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/applications/training/**").hasAnyRole("ADMIN", "OPERATOR")
                        .requestMatchers("/api/applications/**").authenticated()
                        .requestMatchers("/api/applications").authenticated()

                        // ========== 시설·차량 신청 — 로그인 필수 ==========
                        .requestMatchers(HttpMethod.GET, "/api/facility-applications/categories").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/facility-applications").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/facility-applications/my").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/facility-applications/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/facility-applications/**").authenticated()

                        // ========== 파일 (구체 경로 → 광범위 경로 순서 필수) ==========
                        // 공개 이미지 — 비로그인 허용
                        .requestMatchers(HttpMethod.GET, "/api/files/image/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/files/pdf/**").permitAll()
                        // 파일 다운로드 — 로그인 필요
                        .requestMatchers(HttpMethod.GET, "/api/files/download/**").authenticated()
                        .requestMatchers("/download/**").authenticated()
                        // 파일 메타데이터 조회 / 업로드 / 삭제 — 관리자 또는 운영자
                        .requestMatchers("/api/files/**").hasAnyRole("ADMIN", "OPERATOR")

                        // ========== 도메인별 쓰기 API ==========
                        // 공지사항 — 쓰기 authenticated (서비스에서 NOTICE 권한 검증), 고정(PATCH)은 서비스에서 ADMIN 검증
                        .requestMatchers(HttpMethod.POST, "/api/notices/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/notices/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/notices/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/notices/**").authenticated()
                        // 찬양악보 — 조회수 증가는 permitAll, 고정(pin)은 ADMIN, 나머지 쓰기는 authenticated (서비스에서 PRAISE_SHEET 권한 검증)
                        .requestMatchers(HttpMethod.POST, "/api/praise-sheets/*/views").permitAll()
                        .requestMatchers(HttpMethod.PATCH, "/api/praise-sheets/**").hasAnyRole("ADMIN", "OPERATOR")
                        .requestMatchers(HttpMethod.POST, "/api/praise-sheets/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/praise-sheets/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/praise-sheets/**").authenticated()
                        // 설교 — ADMIN + OPERATOR
                        .requestMatchers(HttpMethod.POST, "/api/sermons/**").hasAnyRole("ADMIN", "OPERATOR")
                        .requestMatchers(HttpMethod.PUT, "/api/sermons/**").hasAnyRole("ADMIN", "OPERATOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/sermons/**").hasAnyRole("ADMIN", "OPERATOR")
                        .requestMatchers(HttpMethod.PATCH, "/api/sermons/**").hasAnyRole("ADMIN", "OPERATOR")
                        // 갤러리 — 쓰기 authenticated (서비스에서 DEPARTMENT 권한 검증)
                        .requestMatchers(HttpMethod.POST, "/api/departments/*/gallery").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/departments/*/gallery/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/departments/*/gallery/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/departments/*/gallery/**").authenticated()
                        // 부서 게시판 쓰기 — authenticated (서비스에서 DEPARTMENT 권한 검증), 고정(pin)은 서비스에서 ADMIN 검증
                        .requestMatchers(HttpMethod.POST, "/api/department/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/department/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/department/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/department/**").authenticated()
                        // 스태프 — ADMIN + OPERATOR
                        .requestMatchers(HttpMethod.POST, "/api/staff/**").hasAnyRole("ADMIN", "OPERATOR")
                        .requestMatchers(HttpMethod.PUT, "/api/staff/**").hasAnyRole("ADMIN", "OPERATOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/staff/**").hasAnyRole("ADMIN", "OPERATOR")
                        .requestMatchers(HttpMethod.PATCH, "/api/staff/**").hasAnyRole("ADMIN", "OPERATOR")
                        // 송구영신예배 — GET 조회는 공개, 쓰기는 ADMIN + OPERATOR
                        .requestMatchers(HttpMethod.GET, "/api/newyear/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/newyear/**").hasAnyRole("ADMIN", "OPERATOR")
                        .requestMatchers(HttpMethod.PUT, "/api/newyear/**").hasAnyRole("ADMIN", "OPERATOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/newyear/**").hasAnyRole("ADMIN", "OPERATOR")
                        .requestMatchers(HttpMethod.PATCH, "/api/newyear/**").hasAnyRole("ADMIN", "OPERATOR")
                        // 팝업 — ADMIN 전용 유지
                        .requestMatchers(HttpMethod.POST, "/api/popups/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/popups/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/popups/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/popups/**").hasRole("ADMIN")
                        // 성경학교 — ADMIN 전용 유지
                        .requestMatchers("/api/bibleschool/**").hasRole("ADMIN")
                        // 훈련 콘텐츠 — ADMIN + OPERATOR
                        .requestMatchers(HttpMethod.POST, "/api/trainings/**").hasAnyRole("ADMIN", "OPERATOR")
                        .requestMatchers(HttpMethod.PUT, "/api/trainings/**").hasAnyRole("ADMIN", "OPERATOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/trainings/**").hasAnyRole("ADMIN", "OPERATOR")
                        .requestMatchers(HttpMethod.PATCH, "/api/trainings/**").hasAnyRole("ADMIN", "OPERATOR")
                        // 훈련 신청 승인/초기화 — ADMIN 전용 유지
                        .requestMatchers(HttpMethod.POST, "/api/applications/*/confirm").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/applications/*/reset").hasRole("ADMIN")

                        // ========== 내 정보 조회 — 비로그인 시 null 반환 (401 콘솔 오류 방지) ==========
                        .requestMatchers(HttpMethod.GET, "/api/auth/me").permitAll()

                        // ========== 공개 인증 엔드포인트 — 비로그인 허용 ==========
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/refresh").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/check-email").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/email/send-code").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/email/verify-code").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/password/reset-request").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/password/reset").permitAll()
                        .requestMatchers(HttpMethod.GET,  "/api/auth/password/reset").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/totp/verify").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/totp/setup").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/totp/enable").permitAll()

                        // ========== 공개 소셜 로그인 엔드포인트 ==========
                        .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/social/complete-registration").permitAll()

                        // ========== 공개 조회 API (비로그인 허용) ==========
                        .requestMatchers(HttpMethod.GET, "/api/notices/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/praise-sheets/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/sermons/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/choir/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/bible/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/staff/**").permitAll()
                        // 부서 조회 — 단수(/api/department)·복수(/api/departments) 모두 허용
                        // DepartmentApiController → @RequestMapping("/api/department") (단수)
                        // GalleryImageApiController → @RequestMapping("/api/departments/.../gallery") (복수)
                        .requestMatchers(HttpMethod.GET, "/api/department/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/departments/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/popups/**").permitAll()
                        // 홈페이지 갤러리 — 전체 부서 최신 이미지 공개 조회
                        .requestMatchers(HttpMethod.GET, "/api/galleries/**").permitAll()
                        // 훈련 콘텐츠 조회 — 로그인 필수 (훈련신청 전체 로그인 전용)
                        .requestMatchers(HttpMethod.GET, "/api/trainings/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/visitor/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/help-request").permitAll()
                        // 프론트 에러 리포트 — 비로그인 포함 허용
                        .requestMatchers(HttpMethod.POST, "/api/error-report").permitAll()
                        // Spring 에러 페이지 — 401 루프 방지
                        .requestMatchers("/error").permitAll()

                        // ========== 나머지 — 인증 필수 (기본 보안 정책) ==========
                        // [SECURITY] anyRequest().authenticated() 로 변경
                        // 공개 허용이 필요한 경로는 위에 명시적으로 선언해야 합니다
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                // 필터 체인 순서:
                // RateLimitFilter → JwtAuthenticationFilter → UsernamePasswordAuthenticationFilter
                // Rate Limit 차단 시 JWT 검증까지 도달하지 않음
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * 신뢰된 리버스 프록시의 X-Forwarded-* 헤더를 처리하는 필터
     *
     * 동작 방식:
     *   - Nginx 등 신뢰된 프록시가 설정한 X-Forwarded-For 헤더를 읽어
     *     request.getRemoteAddr()에 실제 클라이언트 IP를 반영
     *   - application.yml forward-headers-strategy: FRAMEWORK 와 함께 동작
     *   - 클라이언트가 직접 X-Forwarded-For 헤더를 조작하여 Rate Limit 우회하는 것을 방지
     *
     * 주의: 직접 인터넷에 노출(프록시 없는 개발 환경)에서는
     *       RemoteAddr가 항상 실제 클라이언트 IP이므로 영향 없음
     */
    @Bean
    public ForwardedHeaderFilter forwardedHeaderFilter() {
        return new ForwardedHeaderFilter();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 허용 오리진: application-local.yml / application-prod.yml 에서 설정
        configuration.setAllowedOrigins(appProperties.getCorsOrigins());

        // 허용 HTTP 메서드
        configuration.setAllowedMethods(
                Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // 허용 헤더 명시 (와일드카드 대신 실제 필요한 헤더만)
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",       // JWT 토큰
                "Content-Type",        // JSON, multipart
                "Accept",
                "Origin",
                "X-Requested-With",
                "Cache-Control"
        ));

        // 노출 헤더: 프론트에서 읽을 수 있는 응답 헤더
        configuration.setExposedHeaders(List.of(
                "Authorization",
                "Content-Disposition"  // 파일 다운로드 시 파일명
        ));

        // 자격증명(쿠키, Authorization 헤더) 허용
        configuration.setAllowCredentials(true);

        // Preflight 캐시 시간 (초)
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
