package com.itda.config;

import com.itda.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .userDetailsService(customUserDetailsService)
                .authorizeHttpRequests(auth -> auth
                        // ── 공개 엔드포인트 ──────────────────────────
                        .requestMatchers(
                                "/api/v1/signup",
                                "/api/v1/login",
                                "/api/v1/refresh",
                                "/api/v1/logout",
                                "/api/v1/auth/**"
                        ).permitAll()

                        // 공고 목록/상세 조회는 비로그인도 허용
                        .requestMatchers(HttpMethod.GET, "/api/v1/job-posts").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/job-posts/liked").hasRole("APPLICANT")
                        .requestMatchers(HttpMethod.GET, "/api/v1/job-posts/*").permitAll()

                        // CORS preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ── 고용주 전용 ─────────────────────────────
                        .requestMatchers(HttpMethod.POST, "/api/v1/job-posts").hasRole("EMPLOYER")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/job-posts/*/close").hasRole("EMPLOYER")
                        .requestMatchers("/api/v1/job-posts/employer/**").hasRole("EMPLOYER")
                        .requestMatchers(HttpMethod.GET, "/api/v1/job-posts/*/applicants").hasRole("EMPLOYER")
                        .requestMatchers(HttpMethod.POST, "/api/v1/job-posts/*/bulk-offer").hasRole("EMPLOYER")
                        .requestMatchers(HttpMethod.GET, "/api/v1/job-posts/*/offer-targets").hasRole("EMPLOYER")
                        .requestMatchers("/api/v1/applications/*/accept").hasRole("EMPLOYER")
                        .requestMatchers("/api/v1/applications/*/reject").hasRole("EMPLOYER")
                        .requestMatchers("/api/v1/workplaces/**").hasRole("EMPLOYER")

                        // 고용주 — 이력서 상세·목록(인재풀)은 /api/v1/resume 하위이므로
                        // 아래 구직자 전용 /resume/** 보다 먼저 선언해야 403이 나지 않음
                        .requestMatchers(HttpMethod.GET, "/api/v1/resume/liked").hasRole("EMPLOYER")
                        .requestMatchers(HttpMethod.GET, "/api/v1/resume/list").hasRole("EMPLOYER")
                        .requestMatchers(HttpMethod.GET, "/api/v1/resume/{resumeId:\\d+}").hasRole("EMPLOYER")

                        // ── 구직자 전용 ─────────────────────────────
                        .requestMatchers(HttpMethod.POST, "/api/v1/job-posts/*/apply").hasRole("APPLICANT")
                        .requestMatchers(HttpMethod.GET, "/api/v1/job-posts/*/applied").hasRole("APPLICANT")
                        .requestMatchers("/api/v1/applications/*/accept-offer").hasRole("APPLICANT")
                        .requestMatchers("/api/v1/worker/**").hasRole("APPLICANT")
                        .requestMatchers("/api/v1/resume/**").hasRole("APPLICANT")

                        // ── 그 외는 인증 필요 ────────────────────────
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // 프론트 배포 주소 + 로컬 개발 주소
        config.setAllowedOrigins(List.of(
                "http://pj-kmucd2-3-itda-s3.s3-website-us-east-1.amazonaws.com",
                "http://localhost:5173",
                "http://localhost:3000"
        ));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true); // credentials: include 필수
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
