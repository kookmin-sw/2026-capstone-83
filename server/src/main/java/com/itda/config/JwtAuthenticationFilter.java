package com.itda.config;

import com.itda.entity.User;
import com.itda.enums.UserStatus;
import com.itda.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = resolveToken(request);

        if (token != null && jwtTokenProvider.validateToken(token)) {
            Long userId = jwtTokenProvider.getUserId(token);
            String role = jwtTokenProvider.getRole(token);

            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();

                // 정지 기간 만료 체크 → 자동 해제
                if (user.isSuspensionExpired()) {
                    user.activate();
                    userRepository.save(user);
                }

                // 정지 상태인 유저는 인증 차단
                if (user.getStatus() == UserStatus.SUSPENDED) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"error\":\"SUSPENDED\",\"message\":\"계정이 정지되었습니다.\",\"suspendedUntil\":\""
                            + (user.getSuspendedUntil() != null ? user.getSuspendedUntil().toString() : "영구정지") + "\"}");
                    return;
                }

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                user, null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + role)));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        // 1. Authorization 헤더에서 토큰 추출
        String bearer = request.getHeader("Authorization");
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }

        // 2. SSE 구독 엔드포인트: 쿼리 파라미터에서 SSE 전용 토큰 추출
        if (request.getRequestURI().contains("/notifications/subscribe")) {
            String tokenParam = request.getParameter("token");
            if (tokenParam != null && !tokenParam.isBlank()) {
                // SSE 전용 토큰인지 검증 (purpose=sse 클레임 확인)
                if (jwtTokenProvider.validateToken(tokenParam)) {
                    String purpose = jwtTokenProvider.getPurpose(tokenParam);
                    if ("sse".equals(purpose)) {
                        return tokenParam;
                    }
                }
            }
        }

        return null;
    }
}
