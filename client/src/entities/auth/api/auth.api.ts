import { authClient, httpClient } from "shared/api/httpClient";
import type { AuthResponse, LoginRequest, SignupRequest } from "../model/types/auth.type";



export const signup = async (data: SignupRequest) => {
  const response = await httpClient.post('/api/v1/signup', data);
  return response.data;
}

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await httpClient.post('/api/v1/login', data);
  return response.data;
}

export const refresh = async (): Promise<AuthResponse> => {
  const response = await httpClient.post('/api/v1/refresh');
  return response.data;
}

export const logout = async () => {
  const response = await authClient.post('/api/v1/logout');
  return response.data;
}