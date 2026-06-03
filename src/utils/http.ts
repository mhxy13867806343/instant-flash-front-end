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

function clearAuthAndRedirect() {
  uni.removeStorageSync(AUTH_TOKEN_STORAGE_KEY);
  // 避免重复跳转
  const pages = getCurrentPages();
  const currentPath = pages.length ? pages[pages.length - 1].route : "";
  if (currentPath !== "pages/login/index") {
    uni.showToast({ title: "登录已过期，请重新登录", icon: "none" });
    setTimeout(() => {
      uni.navigateTo({ url: "/pages/login/index" });
    }, 1000);
  }
}

function extractErrorMessage(data: unknown): string {
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    if (typeof obj.message === "string" && obj.message) return obj.message;
    if (typeof obj.detail === "string" && obj.detail) return obj.detail;
  }
  return "请求失败";
}

export async function httpRequest<T>(url: string, options: RequestOptions = {}) {
  const token = getStoredToken();
  let response: UniApp.RequestSuccessCallbackResult;

  try {
    response = await uni.request({
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
  } catch (error) {
    throw error;
  }

  const statusCode = response.statusCode || 500;

  if (statusCode === 401) {
    clearAuthAndRedirect();
    throw new Error(extractErrorMessage(response.data));
  }

  if (statusCode >= 400) {
    throw new Error(extractErrorMessage(response.data));
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
