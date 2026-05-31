import { http } from "@/utils/http";
import type { ApiComment, ApiPost, ApiPostListResponse, ApiUserProfile, ApiUserProfileUpdate } from "@/types/api";

export function fetchMyProfile() {
  return http.get<ApiUserProfile>("/api/user/profile");
}

export function updateMyProfile(payload: ApiUserProfileUpdate) {
  return http.put<ApiUserProfile>("/api/user/profile", payload);
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
