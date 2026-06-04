import { API_BASE_URL } from "@/config/env";
import { AUTH_TOKEN_STORAGE_KEY } from "@/constants/storage";

export type UploadedMedia = {
  url: string;
  name?: string;
  type?: string;
  size?: number;
};

function getToken() {
  return String(uni.getStorageSync(AUTH_TOKEN_STORAGE_KEY) || "");
}

function parseUploadResult(rawData: string): { ok: boolean; message: string; data: unknown } {
  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(rawData);
  } catch {
    body = {};
  }
  const code = typeof body.code === "number" ? body.code : 200;
  const message = String(body.message || body.detail || "上传失败");
  // 标准包装 {code, message, data} 取 data，否则取 body 本身
  const data = "data" in body ? body.data : body;
  return { ok: code < 400, message, data };
}

/**
 * 上传单张媒体文件到 /api/upload/media
 */
export function uploadMedia(filePath: string, fileName?: string): Promise<UploadedMedia> {
  const token = getToken();
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${API_BASE_URL}/api/upload/media`,
      filePath,
      name: "file",
      header: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      success: (res) => {
        if (res.statusCode >= 400) {
          const { message } = parseUploadResult(res.data);
          reject(new Error(message));
          return;
        }
        const { ok, message, data } = parseUploadResult(res.data);
        if (!ok) {
          reject(new Error(message));
          return;
        }
        const item = (data || {}) as Record<string, unknown>;
        resolve({
          url: String(item.url || ""),
          name: typeof item.name === "string" ? item.name : fileName,
          type: typeof item.type === "string" ? item.type : "image",
          size: typeof item.size === "number" ? item.size : undefined,
        });
      },
      fail: (err) => {
        reject(new Error(err.errMsg || "上传失败"));
      },
    });
  });
}

/**
 * 批量上传：多张图片串行调用单个上传接口
 * 后端虽提供 /api/upload/media/batch，但 uni.uploadFile 一次只能传一个文件，
 * 这里封装为串行上传后聚合结果
 */
export async function uploadMediaList(filePaths: string[], fileNames: string[] = []): Promise<UploadedMedia[]> {
  const results: UploadedMedia[] = [];
  for (let i = 0; i < filePaths.length; i += 1) {
    const result = await uploadMedia(filePaths[i], fileNames[i]);
    results.push(result);
  }
  return results;
}
