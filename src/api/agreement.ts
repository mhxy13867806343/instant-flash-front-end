import { http } from "@/utils/http";

export type AgreementType = "privacy" | "user";

export type Agreement = {
  type: string;
  agreementType: string;
  title: string;
  content: string;
  updatedAt?: string;
  createdAt?: string;
};

/** 获取协议详情（http.ts 已自动解包 {code, message, data}） */
export function fetchAgreement(agreementType: AgreementType) {
  return http.get<Agreement>(`/api/agreements/${agreementType}`);
}
