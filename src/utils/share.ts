/**
 * 跨平台分享工具
 * - H5: 使用 m-share（Mshare.popup）
 * - 其他: 使用 uni.showActionSheet
 */

type MshareInfoMap = {
  [key: string]: {
    title?: string;
    desc?: string;
    link?: string;
    imgUrl?: string;
  };
};

type MshareConfig = {
  title?: string;
  desc?: string;
  link?: string;
  imgUrl?: string;
  types?: string[];
  infoMap?: MshareInfoMap;
  fnDoShare?: (type: string) => void;
};

type MshareGlobal = {
  popup: (config: MshareConfig) => void;
};

declare global {
  interface Window {
    Mshare?: MshareGlobal;
  }
}

let mshareLoading: Promise<MshareGlobal | null> | null = null;

function loadMshare(): Promise<MshareGlobal | null> {
  // #ifdef H5
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }
  if (window.Mshare) {
    return Promise.resolve(window.Mshare);
  }
  if (mshareLoading) {
    return mshareLoading;
  }
  mshareLoading = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "/static/js/h5-share.js";
    script.onload = () => resolve(window.Mshare || null);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
  return mshareLoading;
  // #endif
  // #ifndef H5
  // eslint-disable-next-line no-unreachable
  return Promise.resolve(null);
  // #endif
}

export type SharePayload = {
  title: string;
  desc?: string;
  link?: string;
  imgUrl?: string;
  onShare?: (type: string) => void;
};

/**
 * 显示分享弹窗
 * H5 平台使用 m-share 弹窗（带微信、QQ、微博等图标）
 * 其他平台 fallback 到 uni.showActionSheet
 */
export async function showShare(payload: SharePayload): Promise<void> {
  // #ifdef H5
  const Mshare = await loadMshare();
  if (Mshare) {
    Mshare.popup({
      title: payload.title,
      desc: payload.desc,
      link: payload.link || (typeof window !== "undefined" ? window.location.href : ""),
      imgUrl: payload.imgUrl,
      types: ["wx", "wxline", "qq", "qzone", "sina"],
      fnDoShare: (type: string) => {
        payload.onShare?.(type);
      },
    });
    return;
  }
  // #endif

  // 非 H5 或 m-share 加载失败，使用 uni 的 ActionSheet
  return new Promise((resolve, reject) => {
    uni.showActionSheet({
      itemList: ["转发给朋友", "复制链接", "生成海报"],
      success: (res) => {
        const typeMap = ["wx", "link", "poster"];
        const type = typeMap[res.tapIndex] || "other";
        payload.onShare?.(type);
        resolve();
      },
      fail: () => reject(new Error("已取消")),
    });
  });
}
