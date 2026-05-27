import { computed, ref } from "vue";
import { isValidMobilePhone, maskMobilePhone } from "@/utils/phone";

type AuthProfile = {
  nickname: string;
  phone: string;
  avatarText: string;
};

type StoredAuthState = {
  loggedIn: boolean;
  profile: AuthProfile;
};

const STORAGE_KEY = "instant-flash-auth";

const defaultProfile: AuthProfile = {
  nickname: "即闪用户",
  phone: "138****2468",
  avatarText: "即",
};

const guestProfile: AuthProfile = {
  nickname: "未登录",
  phone: "",
  avatarText: "游",
};

function readStoredState(): StoredAuthState {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY);
    if (!raw) {
      return {
        loggedIn: true,
        profile: defaultProfile,
      };
    }

    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return {
      loggedIn: Boolean(parsed?.loggedIn),
      profile: {
        nickname: String(parsed?.profile?.nickname || defaultProfile.nickname),
        phone: String(parsed?.profile?.phone || defaultProfile.phone),
        avatarText: String(parsed?.profile?.avatarText || defaultProfile.avatarText),
      },
    };
  } catch {
    return {
      loggedIn: true,
      profile: defaultProfile,
    };
  }
}

const initialState = readStoredState();
const isLoggedIn = ref(initialState.loggedIn);
const profile = ref<AuthProfile>(initialState.loggedIn ? initialState.profile : guestProfile);

function persistState() {
  uni.setStorageSync(
    STORAGE_KEY,
    JSON.stringify({
      loggedIn: isLoggedIn.value,
      profile: profile.value,
    })
  );
}

function maskPhone(phone: string) {
  const normalized = phone.replace(/\s+/g, "");
  if (!isValidMobilePhone(normalized)) {
    return defaultProfile.phone;
  }
  return maskMobilePhone(normalized) || defaultProfile.phone;
}

function getAvatarText(nickname: string) {
  return nickname.trim().slice(0, 1) || defaultProfile.avatarText;
}

function isTabPage(url: string) {
  return ["/pages/home/index", "/pages/profile/index"].includes(url);
}

export function useAuth() {
  const displayName = computed(() => profile.value.nickname || guestProfile.nickname);
  const displayPhone = computed(() => profile.value.phone);

  function login(payload: { phone: string; nickname?: string }) {
    const nickname = payload.nickname?.trim() || defaultProfile.nickname;
    profile.value = {
      nickname,
      phone: maskPhone(payload.phone),
      avatarText: getAvatarText(nickname),
    };
    isLoggedIn.value = true;
    persistState();
  }

  function logout() {
    isLoggedIn.value = false;
    profile.value = guestProfile;
    persistState();
  }

  function openLoginPage(redirect = "/pages/profile/index") {
    const url = `/pages/login/index?redirect=${encodeURIComponent(redirect)}`;
    uni.navigateTo({ url });
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
    displayName,
    displayPhone,
    login,
    logout,
    openLoginPage,
    ensureLogin,
    finishLoginRedirect,
  };
}
