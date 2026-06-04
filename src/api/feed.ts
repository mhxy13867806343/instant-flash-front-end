import { http } from "@/utils/request";
import type {
  ApiComment,
  ApiCommentCreatePayload,
  ApiCommentListResponse,
  ApiLikeResponse,
  ApiPost,
  ApiPostListParams,
  ApiPostListResponse,
} from "@/types/api";

export function fetchFeedList(params: ApiPostListParams) {
  // 过滤掉 null/undefined/空字符串的参数，避免传无效 query
  const query: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== "") {
      query[key] = value;
    }
  }
  return http.get<ApiPostListResponse>("/api/posts", query);
}

export function fetchFeedDetail(id: string) {
  return http.get<ApiPost>(`/api/posts/${id}`);
}

export function fetchFeedComments(id: string, params?: { limit?: number; offset?: number }) {
  const query: Record<string, unknown> = {};
  if (params?.limit !== undefined) {
    query.limit = params.limit;
  }
  if (params?.offset !== undefined) {
    query.offset = params.offset;
  }
  return http.get<ApiCommentListResponse | ApiComment[]>(`/api/posts/${id}/comments`, query);
}

export function fetchCommentReplies(
  postId: string,
  commentId: string,
  params?: { limit?: number; offset?: number }
) {
  const query: Record<string, unknown> = {};
  if (params?.limit !== undefined) {
    query.limit = params.limit;
  }
  if (params?.offset !== undefined) {
    query.offset = params.offset;
  }
  return http.get<ApiCommentListResponse | ApiComment[]>(
    `/api/posts/${postId}/comments/${commentId}/replies`,
    query
  );
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

export type PostImageItem = {
  url: string;
  name?: string;
  type?: string;
};

export type CreatePostPayload = {
  content: string;
  images?: PostImageItem[];
  location?: string;
  province?: string;
  city?: string;
  district?: string;
  topics?: string[];
};

export function createPost(payload: CreatePostPayload) {
  return http.post<ApiPost>("/api/posts", payload);
}
