import { http } from "@/utils/request";
import type { ApiComment, ApiCommentCreatePayload, ApiLikeResponse, ApiPost, ApiPostListResponse } from "@/types/api";

export function fetchFeedList(params: { limit: number; offset: number }) {
  return http.get<ApiPostListResponse>("/api/posts", params);
}

export function fetchFeedDetail(id: string) {
  return http.get<ApiPost>(`/api/posts/${id}`);
}

export function fetchFeedComments(id: string) {
  return http.get<ApiComment[]>(`/api/posts/${id}/comments`);
}

export function createFeedComment(id: string, payload: ApiCommentCreatePayload) {
  return http.post<ApiComment>(`/api/posts/${id}/comments`, payload);
}

export function toggleFeedLike(id: string) {
  return http.post<ApiLikeResponse>(`/api/posts/${id}/like`);
}

export function createFeedShare(id: string) {
  return http.post(`/api/posts/${id}/share`, {});
}
