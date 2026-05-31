import { computed, ref } from "vue";
import { fetchDevToken, loginWithWeChat as wxLogin } from "@/api/auth";
import { fetchMyProfile, updateMyProfile } from "@/api/user";
import { AUTH_REDIRECT_STORAGE_KEY, AUTH_STATE_STORAGE_KEY, AUTH_TOKEN_STORAGE_KEY } from "@/constants/storage";
import type { ApiUserProfile } from "@/types/api";
import { isValidMobilePhone, maskMobilePhone } from "@/utils/phone";

export type AuthProfile = {
  userId: string;
  nickname: string;
  phone: string;
  avatar: string;
  avatarText: string;
  gender: "男" | "女" | "保密";
  bio: string;
  province: string;
  city: string;
  district: string;
};

type StoredAuthState = {
  loggedIn: boolean;
  token: string;
  profile: AuthProfile;
};

const defaultProfile: AuthProfile = {
  userId: "",
  nickname: "即闪用户",
  phone: "",
  avatar: "",
  avatarText: "即",
  gender: "保密",
  bio: "记录生活灵感，分享值得被看见的瞬间。",
  province: "",
  city: "",
  district: "",
};

const guestProfile: AuthProfile = {
  userId: "",
  nickname: "未登录",
  phone: "",
  avatar: "",
  avatarText: "游",
  gender: "保密",
  bio: "",
  province: "",
  city: "",
  district: "",
};

function normalizeGender(value?: string | null): AuthProfile["gender"] {
  if (value === "男" || value === "male" || value === "Male") {
    return "男";
  }
  if (value === "女" || value === "female" || value === "Female") {
    return "女";
  }
  return "保密";
}

function getAvatarText(nickname: string) {
  return nickname.trim().slice(0, 1) || defaultProfile.avatarText;
}

function buildAuthProfile(source?: Partial<AuthProfile> | ApiUserProfile | null, fallback?: Partial<AuthProfile>): AuthProfile {
  const nickname = String(source?.nickname || fallback?.nickname || defaultProfile.nickname).trim() || defaultProfile.nickname;
  const phone = String(source?.phone || fallback?.phone || "");
  const bio = String(source?.bio || fallback?.bio || defaultProfile.bio);

  return {
    userId: String(source?.userId || fallback?.userId || ""),
    nickname,
    phone,
    avatar: String(source?.avatar || fallback?.avatar || ""),
    avatarText: getAvatarText(nickname),
    gender: normalizeGender(source?.gender || fallback?.gender),
    bio,
    province: String(source?.province || fallback?.province || ""),
    city: String(source?.city || fallback?.city || ""),
    district: String(source?.district || fallback?.district || ""),
  };
}

function readStoredState(): StoredAuthState {
  try {
    const raw = uni.getStorageSync(AUTH_STATE_STORAGE_KEY);
    const token = String(uni.getStorageSync(AUTH_TOKEN_STORAGE_KEY) || "");
    if (!raw) {
      return {
        loggedIn: Boolean(token),
        token,
        profile: Boolean(token) ? defaultProfile : guestProfile,
      };
    }

    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return {
      loggedIn: Boolean(parsed?.loggedIn && token),
      token,
      profile: buildAuthProfile(parsed?.profile, parsed?.profile),
    };
  } catch {
    return {
      loggedIn: false,
      token: "",
      profile: guestProfile,
    };
  }
}

const initialState = readStoredState();
const isLoggedIn = ref(initialState.loggedIn);
const profile = ref<AuthProfile>(initialState.loggedIn ? initialState.profile : guestProfile);
const token = ref(initialState.token);

function persistState() {
  uni.setStorageSync(
    AUTH_STATE_STORAGE_KEY,
    JSON.stringify({
      loggedIn: isLoggedIn.value,
      profile: profile.value,
    })
  );
  if (token.value) {
    uni.setStorageSync(AUTH_TOKEN_STORAGE_KEY, token.value);
    return;
  }
  uni.removeStorageSync(AUTH_TOKEN_STORAGE_KEY);
}

function isTabPage(url: string) {
  return ["/pages/home/index", "/pages/profile/index"].includes(url);
}

function setPendingRedirect(redirect: string) {
  uni.setStorageSync(AUTH_REDIRECT_STORAGE_KEY, redirect);
}

function consumePendingRedirect() {
  const redirect = String(uni.getStorageSync(AUTH_REDIRECT_STORAGE_KEY) || "");
  if (redirect) {
    uni.removeStorageSync(AUTH_REDIRECT_STORAGE_KEY);
  }
  return redirect || "/pages/profile/index";
}

async function resolveProfileFromServer(fallback?: Partial<AuthProfile>) {
  try {
    const remoteProfile = await fetchMyProfile();
    return buildAuthProfile(remoteProfile, fallback);
  } catch {
    return buildAuthProfile(fallback, fallback);
  }
}

export function useAuth() {
  const displayName = computed(() => profile.value.nickname || guestProfile.nickname);
  const displayPhone = computed(() => {
    if (!profile.value.phone) {
      return "";
    }
    return isValidMobilePhone(profile.value.phone) ? maskMobilePhone(profile.value.phone) : profile.value.phone;
  });

  async function login(payload: { phone: string; nickname?: string }) {
    const normalizedPhone = payload.phone.replace(/\D/g, "") || "13800138000";
    const fallbackProfile = buildAuthProfile({
      phone: normalizedPhone,
      nickname: payload.nickname?.trim() || defaultProfile.nickname,
      bio: defaultProfile.bio,
    });
    try {
      const result = await fetchDevToken({
        userId: `h5-${normalizedPhone}`,
        nickname: payload.nickname?.trim() || defaultProfile.nickname,
      });
      token.value = result.accessToken;
      profile.value = await resolveProfileFromServer({
        userId: result.userId,
        phone: normalizedPhone,
        nickname: payload.nickname?.trim() || defaultProfile.nickname,
        bio: defaultProfile.bio,
      });
    } catch {
      token.value = "";
      profile.value = fallbackProfile;
    }
    isLoggedIn.value = true;
    persistState();
  }

  async function loginByWeChat(payload?: { nickname?: string; avatar?: string; phone?: string; gender?: string }) {
    let code = "";
    // #ifdef MP-WEIXIN
    const loginResult = await uni.login({
      provider: "weixin",
    });
    code = loginResult.code || "";
    // #endif

    if (!code) {
      await login({
        phone: payload?.phone || "13800138000",
        nickname: payload?.nickname || defaultProfile.nickname,
      });
      return;
    }

    try {
      const result = await wxLogin({
        code,
        nickname: payload?.nickname,
        avatar: payload?.avatar,
        phone: payload?.phone,
        gender: payload?.gender,
      });
      token.value = result.accessToken || result.token;
      profile.value = buildAuthProfile(result.user, {
        bio: profile.value.bio || defaultProfile.bio,
      });
      isLoggedIn.value = true;
      persistState();
    } catch {
      await login({
        phone: payload?.phone || "13800138000",
        nickname: payload?.nickname || defaultProfile.nickname,
      });
    }
  }

  async function refreshProfile() {
    if (!token.value || !isLoggedIn.value) {
      return;
    }
    try {
      profile.value = await resolveProfileFromServer(profile.value);
      isLoggedIn.value = true;
      persistState();
    } catch {
      // Keep local profile when remote profile is temporarily unavailable.
    }
  }

  async function updateProfile(payload: { nickname: string; gender: AuthProfile["gender"]; bio: string }) {
    const nickname = payload.nickname.trim() || defaultProfile.nickname;
    const localProfile = buildAuthProfile(
      {
        ...profile.value,
        nickname,
        gender: payload.gender,
        bio: payload.bio.trim() || profile.value.bio || defaultProfile.bio,
      },
      profile.value
    );
    if (!token.value) {
      profile.value = localProfile;
      persistState();
      return;
    }
    const result = await updateMyProfile({
      nickname,
      gender: payload.gender,
      phone: profile.value.phone || null,
      avatar: profile.value.avatar || null,
      province: profile.value.province || null,
      city: profile.value.city || null,
      district: profile.value.district || null,
    });
    profile.value = buildAuthProfile(result, {
      ...localProfile,
      bio: payload.bio.trim() || profile.value.bio || defaultProfile.bio,
    });
    persistState();
  }

  function logout() {
    isLoggedIn.value = false;
    token.value = "";
    profile.value = guestProfile;
    persistState();
  }

  function openLoginPage(redirect = "/pages/profile/index") {
    setPendingRedirect(redirect);
    uni.navigateTo({ url: "/pages/login/index" });
  }

  function ensureLogin(redirect = "/pages/profile/index") {
    if (isLoggedIn.value) {
      return true;
    }

    uni.showToast({
      title: "请先登录",
      icon: "none",
    });
    openLoginPage(redirect);
    return false;
  }

  function finishLoginRedirect(redirect?: string) {
    const target = redirect || "/pages/profile/index";
    if (isTabPage(target)) {
      uni.switchTab({ url: target });
      return;
    }

    const pages = getCurrentPages();
    if (pages.length > 1) {
      uni.redirectTo({ url: target });
      return;
    }

    uni.navigateTo({ url: target });
  }

  return {
    isLoggedIn,
    profile,
    token,
    displayName,
    displayPhone,
    login,
    loginByWeChat,
    refreshProfile,
    updateProfile,
    logout,
    openLoginPage,
    ensureLogin,
    finishLoginRedirect,
    consumePendingRedirect,
  };
}
