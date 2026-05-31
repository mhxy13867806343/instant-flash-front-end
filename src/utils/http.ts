import { API_BASE_URL } from "@/config/env";
import { AUTH_TOKEN_STORAGE_KEY } from "@/constants/storage";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  data?: unknown;
  header?: Record<string, string>;
  timeout?: number;
};

function getStoredToken() {
  return String(uni.getStorageSync(AUTH_TOKEN_STORAGE_KEY) || "");
}

export async function httpRequest<T>(url: string, options: RequestOptions = {}) {
  const token = getStoredToken();
  const [error, response] = await uni.request({
    url: `${API_BASE_URL}${url}`,
    method: options.method || "GET",
    data: options.data,
    timeout: options.timeout || 15000,
    header: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.header || {}),
    },
  });

  if (error) {
    throw error;
  }

  const statusCode = response.statusCode || 500;
  if (statusCode >= 400) {
    const detail =
      typeof response.data === "object" && response.data !== null && "detail" in response.data
        ? String((response.data as { detail?: string }).detail || "请求失败")
        : "请求失败";
    throw new Error(detail);
  }

  return response.data as T;
}

export const http = {
  get<T>(url: string, data?: Record<string, unknown>) {
    return httpRequest<T>(url, { method: "GET", data });
  },
  post<T>(url: string, data?: unknown) {
    return httpRequest<T>(url, { method: "POST", data });
  },
  put<T>(url: string, data?: unknown) {
    return httpRequest<T>(url, { method: "PUT", data });
  },
  delete<T>(url: string) {
    return httpRequest<T>(url, { method: "DELETE" });
  },
};
