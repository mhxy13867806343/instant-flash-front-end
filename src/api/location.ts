import { http } from "@/utils/http";

export type ApiLocation = {
  id?: string;
  name?: string;
  displayName?: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  lng?: number;
  lat?: number;
  province?: string;
  city?: string;
  district?: string;
};

type RawLocationResponse =
  | ApiLocation[]
  | {
      items?: ApiLocation[];
      list?: ApiLocation[];
      total?: number;
    };

function pickDisplayName(item: ApiLocation): string {
  if (item.displayName) return item.displayName;
  const parts = [item.city || item.province, item.district, item.name].filter(Boolean);
  return parts.join(" · ");
}

function normalizeLocations(response: RawLocationResponse): ApiLocation[] {
  if (Array.isArray(response)) {
    return response;
  }
  if (response && typeof response === "object") {
    return response.items || response.list || [];
  }
  return [];
}

/**
 * 获取附近 POI 列表
 * 后端用经纬度调天地图返回附近的位置
 */
export async function fetchNearbyLocations(params: {
  longitude?: number;
  latitude?: number;
  lng?: number;
  lat?: number;
  limit?: number;
}): Promise<{ raw: ApiLocation[]; displayList: string[] }> {
  const query: Record<string, unknown> = {
    limit: params.limit ?? 10,
  };

  // 同时传 longitude/latitude 和 lng/lat 兼容后端两种命名
  const longitude = params.longitude ?? params.lng;
  const latitude = params.latitude ?? params.lat;
  if (longitude !== undefined) {
    query.longitude = longitude;
    query.lng = longitude;
  }
  if (latitude !== undefined) {
    query.latitude = latitude;
    query.lat = latitude;
  }

  const response = await http.get<RawLocationResponse>("/api/locations/nearby", query);
  const raw = normalizeLocations(response);
  const displayList = raw.map(pickDisplayName).filter(Boolean);

  return { raw, displayList };
}
