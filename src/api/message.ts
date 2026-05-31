import { http } from "@/utils/http";
import type { ApiMessage } from "@/types/api";

export function fetchMessages() {
  return http.get<{ items?: ApiMessage[] } | ApiMessage[]>("/api/messages");
}
