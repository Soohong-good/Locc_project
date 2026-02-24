package com.example.locc.config;

import com.example.locc.security.CustomOAuth2UserService;
import com.example.locc.security.JwtAuthenticationEntryPoint;
import com.example.locc.security.JwtAuthenticationFilter;
import com.example.locc.security.OAuth2SuccessHandler;
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
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final UserDetailsService userDetailsService;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final AppProperties appProperties;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception ->
                        exception.authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService))
                        .successHandler(oAuth2SuccessHandler)
                )
                .authorizeHttpRequests(auth -> auth
                        // ========== 정적 리소스 ==========
                        .requestMatchers("/favicon.ico").permitAll()
                        .requestMatchers("/.well-known/**").permitAll()
                        .requestMatchers("/css/**", "/js/**", "/images/**").permitAll()
                        
                        // ========== 관리자 전용 영역 (ADMIN 권한 필수) ==========
                        // 관리자 View 페이지
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        
                        // 관리자 전용 API (행동만 담당: 수정/삭제/상태 변경)
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        
                        // ========== 로그인 필수 ==========
                        // 마이페이지
                        .requestMatchers("/mypage/**").authenticated()
                        .requestMatchers("/api/mypage/**").authenticated()
                        
                        // 훈련 신청 관련
                        .requestMatchers("/training/application/my").authenticated()
                        .requestMatchers("/training/application/apply/**").authenticated()
                        .requestMatchers("/api/applications").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/applications/*").authenticated()
                        
                        // 주보 (로그인 필수)
                        .requestMatchers("/church/bulletin/**").authenticated()
                        .requestMatchers("/api/bulletin/**").authenticated()
                        
                        // 파일 다운로드 (인증 필요)
                        .requestMatchers("/api/files/download/**").authenticated()
                        .requestMatchers("/download/**").authenticated()

                        // 공개 이미지 (인증 불필요 - 에디터 본문 이미지, 썸네일, 갤러리)
                        .requestMatchers("/api/files/image/**").permitAll()

                        // ========== 도메인별 관리 API (ADMIN 권한 필수) ==========
                        // 공지사항 생성/수정/삭제
                        .requestMatchers(HttpMethod.POST, "/api/notices/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/notices/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/notices/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/notices/**").hasRole("ADMIN")

                        // 주보 생성/수정/삭제
                        .requestMatchers(HttpMethod.POST, "/api/bulletins/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/bulletins/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/bulletins/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/bulletins/**").hasRole("ADMIN")

                        // 설교 생성/수정/삭제
                        .requestMatchers(HttpMethod.POST, "/api/sermons/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/sermons/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/sermons/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/sermons/**").hasRole("ADMIN")

                        // 파일 업로드/삭제
                        .requestMatchers("/api/files/**").hasRole("ADMIN")

                        // 갤러리 관리
                        .requestMatchers(HttpMethod.POST, "/api/departments/*/gallery").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/departments/*/gallery/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/departments/*/gallery/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/departments/*/gallery/**").hasRole("ADMIN")

                        // 송구영신예배 관리
                        .requestMatchers("/api/newyear/**").hasRole("ADMIN")

                        // 성경학교 관리
                        .requestMatchers("/api/bibleschool/**").hasRole("ADMIN")

                        // 훈련 관리
                        .requestMatchers(HttpMethod.POST, "/api/trainings/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/trainings/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/trainings/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/trainings/**").hasRole("ADMIN")

                        // 훈련 신청 관리
                        .requestMatchers(HttpMethod.POST, "/api/applications/*/confirm").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/applications/*/reset").hasRole("ADMIN")

                        // ========== 공개 영역 (조회만 허용, 비로그인 OK) ==========
                        .anyRequest().permitAll()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
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

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(appProperties.getCorsOrigins());
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}