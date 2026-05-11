import type { UserType } from "entities/user/model/types/user.type";

export interface SignupRequest {
  role: UserType;
  email: string;
  password: string;
  name: string;
  birth: string;
  location: string;
  phone: string;
  gender: number;
  businessNumber?: string;

}

export interface LoginRequest {
  role: UserType;
  email: string;
  password: string;
}

export interface AuthResponse {
  role: UserType;
  accessToken: string;
}

// 토큰 재발급 응답 — role은 로그인 시 받은 값을 클라이언트가 그대로 사용
export interface RefreshResponse {
  accessToken: string;
}