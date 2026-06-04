import { http } from "@/utils/http";

export type ApiTopic = {
  id?: string;
  name: string;
  count?: number;
};

export type ApiTopicListResponse = {
  items: ApiTopic[] | string[];
  total?: number;
  limit?: number;
  offset?: number;
  hasMore?: boolean;
};

function normalizeTopicList(response: ApiTopicListResponse | ApiTopic[] | string[]): string[] {
  const items = Array.isArray(response) ? response : response.items || [];
  return items
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "name" in item) return String(item.name || "");
      return "";
    })
    .filter(Boolean);
}

/**
 * 获取话题/标签列表
 * @param params.keyword 搜索关键词，不传则返回推荐
 * @param params.limit 默认 10
 */
export async function fetchTopics(params?: { keyword?: string; limit?: number; offset?: number }): Promise<string[]> {
  const query: Record<string, unknown> = {
    limit: params?.limit ?? 10,
  };
  if (params?.offset !== undefined) {
    query.offset = params.offset;
  }
  if (params?.keyword) {
    query.keyword = params.keyword;
  }

  const response = await http.get<ApiTopicListResponse | ApiTopic[] | string[]>("/api/topics", query);
  return normalizeTopicList(response);
}

/** 推荐话题（固定前 10） */
export async function fetchRecommendedTopics(limit = 10): Promise<string[]> {
  return fetchTopics({ limit });
}

/** 搜索话题 */
export async function searchTopicOptions(keyword: string, limit = 10): Promise<string[]> {
  const normalized = keyword.replace(/^#/, "").trim();
  if (!normalized) return [];
  return fetchTopics({ keyword: normalized, limit });
}
