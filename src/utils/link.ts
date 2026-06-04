/**
 * 跨平台打开外部链接
 * - H5: 直接新窗口打开
 * - 其他: 复制链接到剪贴板并提示
 */
export function openExternalLink(url: string) {
  if (!url) return;

  // #ifdef H5
  if (typeof window !== "undefined") {
    window.open(url, "_blank");
    return;
  }
  // #endif

  // 非 H5：复制到剪贴板
  uni.setClipboardData({
    data: url,
    success: () => {
      uni.showToast({ title: "链接已复制，请在浏览器打开", icon: "none" });
    },
  });
}

/**
 * 复制文本到剪贴板（如 QQ、微信号、邮箱）
 */
export function copyText(text: string, tip = "已复制") {
  if (!text) return;
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({ title: tip, icon: "none" });
    },
  });
}
