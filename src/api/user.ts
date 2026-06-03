import { http } from "@/utils/http";
import { API_BASE_URL } from "@/config/env";
import { AUTH_TOKEN_STORAGE_KEY } from "@/constants/storage";
import type { ApiComment, ApiPost, ApiPostListResponse, ApiUserProfile, ApiUserProfileUpdate } from "@/types/api";

export function fetchMyProfile() {
  return http.get<ApiUserProfile>("/api/user/profile");
}

export function updateMyProfile(payload: ApiUserProfileUpdate) {
  return http.put<ApiUserProfile>("/api/user/profile", payload);
}

export function bindMyPhone(payload: { phone: string; code: string }) {
  return http.post<ApiUserProfile>("/api/user/bindPhone", payload);
}

export function uploadAvatar(filePath: string): Promise<ApiUserProfile> {
  const token = String(uni.getStorageSync(AUTH_TOKEN_STORAGE_KEY) || "");
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${API_BASE_URL}/api/user/profile/avatar`,
      filePath,
      name: "file",
      header: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      success: (res) => {
        let body: Record<string, unknown> = {};
        try {
          body = JSON.parse(res.data);
        } catch {
          // ignore
        }

        if (res.statusCode >= 400 || (body.code && Number(body.code) >= 400)) {
          const message = String(body.message || body.detail || "上传失败");
          reject(new Error(message));
          return;
        }

        resolve(body as unknown as ApiUserProfile);
      },
      fail: (err) => {
        reject(new Error(err.errMsg || "上传失败"));
      },
    });
  });
}

type PageParams = {
  limit: number;
  offset: number;
};

export function fetchMyPosts(params: PageParams) {
  return http.get<ApiPostListResponse>("/api/user/posts", params);
}

export function fetchMyLikes(params: PageParams) {
  return http.get<ApiPostListResponse>("/api/user/likes", params);
}

export function fetchMyShares(params: PageParams) {
  return http.get<ApiPostListResponse>("/api/user/shares", params);
}

export function fetchMyComments(params: PageParams) {
  return http.get<{ items?: ApiComment[]; total?: number; limit?: number; offset?: number } | ApiComment[]>(
    "/api/user/comments",
    params
  );
}
