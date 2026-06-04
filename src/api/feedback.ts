import { http } from "@/utils/http";

export type FeedbackFieldOption = {
  label?: string;
  value?: string;
};

export type FeedbackField = {
  fieldId: string;
  fieldKey: string;
  label: string;
  type: "phone" | "input" | "textarea" | "select" | string;
  placeholder?: string;
  required?: boolean;
  options?: FeedbackFieldOption[] | string[];
  sort?: number;
  status?: string;
  isDefault?: boolean;
  remark?: string;
};

export type FeedbackForm = {
  configId: string;
  title: string;
  menuTitle?: string;
  description?: string;
  submitButtonText?: string;
  successMessage?: string;
  fields: FeedbackField[];
};

export type FeedbackSubmitPayload = {
  phone?: string;
  title?: string;
  content?: string;
  data?: Record<string, unknown>;
};

/** 获取反馈表单配置（http.ts 已自动解包 {code, message, data}） */
export function fetchFeedbackForm() {
  return http.get<FeedbackForm>("/api/feedback/form");
}

/** 提交反馈 */
export function submitFeedback(payload: FeedbackSubmitPayload) {
  return http.post<{ id?: string }>("/api/feedback", payload);
}
