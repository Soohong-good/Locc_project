package com.example.locc.config;

import com.example.locc.security.JwtAuthenticationEntryPoint;
import com.example.locc.security.JwtAuthenticationFilter;
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

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception ->
                        exception.authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .authorizeHttpRequests(auth -> auth
                        // ========== 완전 Public (비로그인 OK) ==========
                        .requestMatchers("/", "/index", "/error").permitAll()
                        .requestMatchers("/css/**", "/js/**", "/images/**").permitAll()
                        .requestMatchers("/api-docs/**", "/swagger-ui/**").permitAll()

                        // 인증 엔드포인트
                        .requestMatchers("/api/auth/**").permitAll()

                        // 공개 페이지 (비로그인 조회 가능)
                        .requestMatchers(HttpMethod.GET, "/notice/**", "/sermon/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/about", "/contact", "/salvation", "/worship", "/message", "/ministry", "/staff").permitAll()

                        // 공개 API (비로그인 조회 가능)
                        .requestMatchers(HttpMethod.GET, "/api/notices/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/sermons/**").permitAll()

                        // ========== 로그인 필요 (일반 교인) ==========
                        // 파일 다운로드는 로그인 필수
                        .requestMatchers("/api/attachments/download/**").authenticated()
                        .requestMatchers("/download/**").authenticated()

                        // ========== 관리자만 (ADMIN) ==========
                        // 공지사항 관리
                        .requestMatchers(HttpMethod.POST, "/api/notices/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/notices/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/notices/**").hasRole("ADMIN")

                        // 설교 관리
                        .requestMatchers(HttpMethod.POST, "/api/sermons/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/sermons/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/sermons/**").hasRole("ADMIN")

                        // 파일 업로드
                        .requestMatchers("/api/attachments/upload/**").hasRole("ADMIN")

                        // 관리자 페이지
                        .requestMatchers("/admin/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
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
        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://localhost:8080",
                "https://yourdomain.com"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}