import { http } from "@/utils/http";
import type { ApiTokenResponse, ApiWxLoginPayload, ApiWxLoginResponse } from "@/types/api";

type DevTokenPayload = {
  userId?: string;
  openid?: string;
  unionid?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
};

export function fetchDevToken(payload: DevTokenPayload = {}) {
  return http.post<ApiTokenResponse>("/api/auth/dev-token", payload);
}

export function loginWithWeChat(payload: ApiWxLoginPayload) {
  return http.post<ApiWxLoginResponse>("/api/auth/wx-login", payload);
}
