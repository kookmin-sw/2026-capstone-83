package com.itda.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * 토큰 재발급 응답 DTO
 * 로그인 시 받은 role은 클라이언트가 이미 보관하고 있으므로
 * refresh 응답에는 새 accessToken만 내려준다.
 */
@Getter
@AllArgsConstructor
@Builder
public class RefreshResponse {
    private String accessToken;
}
