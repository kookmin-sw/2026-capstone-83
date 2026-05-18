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
                        // CORS 프리플라이트 통과
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 인증 관련 공개 엔드포인트
                        .requestMatchers(
                                "/api/v1/signup",
                                "/api/v1/login",
                                "/api/v1/refresh",
                                "/api/v1/logout",
                                "/api/v1/auth/**"
                        ).permitAll()

                        // 공고 목록/상세 조회는 비로그인 허용
                        .requestMatchers(HttpMethod.GET, "/api/v1/job-posts").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/job-posts/*").permitAll()

                        // 매니저 전용 엔드포인트
                        .requestMatchers("/api/v1/manager/**").hasRole("MANAGER")

                        // 그 외는 모두 인증 필요
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
        // 응답에서 FE 가 읽을 수 있도록 명시 노출.
        // - X-Request-Id: 공고 목록 응답 → 클릭 시 같은 값을 X-Request-Id 헤더로 되돌려 보내 NDCG@10 정확도 향상
        config.setExposedHeaders(List.of("X-Request-Id"));
        config.setAllowCredentials(true); // credentials: include 필수
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
