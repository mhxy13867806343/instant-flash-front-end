export const MOBILE_PHONE_REGEX = /^1[3-9]\d{9}$/;

export function sanitizeMobilePhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

export function isValidMobilePhone(value: string) {
  return MOBILE_PHONE_REGEX.test(value.trim());
}

export function maskMobilePhone(value: string) {
  const normalized = value.replace(/\s+/g, "");
  if (!isValidMobilePhone(normalized)) {
    return "";
  }

  return `${normalized.slice(0, 3)}****${normalized.slice(-4)}`;
}
