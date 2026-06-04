import { http } from "@/utils/http";

export type ApiTopic = {
  tagId?: string;
  topicId?: string;
  id?: string;
  name?: string;
  label?: string;
  value?: string;
  displayName?: string;
};

// http.ts 已自动解包 {code, message, data}，这里收到的是 data 部分
type RawTopicResponse =
  | ApiTopic[]
  | string[]
  | {
      items?: ApiTopic[] | string[];
      list?: ApiTopic[] | string[];
      recommended?: ApiTopic[] | string[];
      searchResults?: ApiTopic[] | string[];
      total?: number;
      searchTotal?: number;
      hasMore?: boolean;
    };

function pickName(item: unknown): string {
  if (typeof item === "string") return item.replace(/^#+/, "").trim();
  if (item && typeof item === "object") {
    const obj = item as ApiTopic;
    const raw = String(obj.displayName || obj.name || obj.label || obj.value || "");
    return raw.replace(/^#+/, "").trim();
  }
  return "";
}

function normalizeTopicList(
  response: RawTopicResponse,
  prefer: "recommended" | "search" | "list" = "list"
): string[] {
  if (Array.isArray(response)) {
    return response.map(pickName).filter(Boolean);
  }

  if (response && typeof response === "object") {
    const obj = response as Record<string, unknown>;
    const candidates: unknown[] = [];

    if (prefer === "recommended") {
      candidates.push(obj.recommended, obj.list, obj.items, obj.searchResults);
    } else if (prefer === "search") {
      candidates.push(obj.searchResults, obj.list, obj.items, obj.recommended);
    } else {
      candidates.push(obj.list, obj.items, obj.recommended, obj.searchResults);
    }

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        const list = candidate.map(pickName).filter(Boolean);
        if (list.length) return list;
      }
    }
  }

  return [];
}

async function requestTopics(
  params?: { keyword?: string; limit?: number; offset?: number },
  prefer: "recommended" | "search" | "list" = "list"
): Promise<string[]> {
  const query: Record<string, unknown> = {
    limit: params?.limit ?? 10,
  };
  if (params?.offset !== undefined) {
    query.offset = params.offset;
  }
  if (params?.keyword) {
    query.keyword = params.keyword;
  }

  const response = await http.get<RawTopicResponse>("/api/topics", query);
  return normalizeTopicList(response, prefer);
}

/** 推荐话题（固定前 10） */
export async function fetchRecommendedTopics(limit = 10): Promise<string[]> {
  return requestTopics({ limit }, "recommended");
}

/** 搜索话题 */
export async function searchTopicOptions(keyword: string, limit = 10): Promise<string[]> {
  const normalized = keyword.replace(/^#/, "").trim();
  if (!normalized) return [];
  return requestTopics({ keyword: normalized, limit }, "search");
}

/** 通用查询 */
export async function fetchTopics(params?: { keyword?: string; limit?: number; offset?: number }): Promise<string[]> {
  return requestTopics(params, params?.keyword ? "search" : "recommended");
}
