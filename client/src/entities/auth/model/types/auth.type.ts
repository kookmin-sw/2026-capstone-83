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
  email: string;
  password: string;
}

export interface AuthResponse {
  role: UserType;
  accessToken: string;
}