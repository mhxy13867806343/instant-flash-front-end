<template>
  <view class="page-shell login-page">
    <view class="card-shell login-card">
      <view class="login-hero">
        <text class="login-hero__title">欢迎回来</text>
        <text class="login-hero__desc">登录后即可发布动态、查看互动消息，也能继续管理你的评论和草稿。</text>
      </view>

      <view class="login-quick-panel">
        <u-button type="primary" shape="circle" @click="quickLogin">一键登录</u-button>
        <text class="login-quick-panel__hint">推荐使用本机号码一键登录，更快进入即闪。</text>
      </view>

      <view class="login-divider">
        <text class="login-divider__text">其他登录方式</text>
      </view>

      <view class="login-mode login-mode--bottom">
        <button
          v-for="item in modeOptions"
          :key="item.value"
          class="login-mode__item"
          :class="{ 'login-mode__item--active': mode === item.value }"
          @tap="switchMode(item.value)"
        >
          {{ item.label }}
        </button>
      </view>

      <u-form label-position="top">
        <u-form-item label="手机号" :border-bottom="false">
          <u-input
            v-model="phone"
            type="number"
            maxlength="11"
            clearable
            placeholder="请输入手机号"
            border
            @input="sanitizePhoneInput"
          />
        </u-form-item>

        <u-form-item v-if="mode === 'code'" label="验证码" :border-bottom="false">
          <view class="login-inline">
            <u-input
              v-model="code"
              type="number"
              maxlength="6"
              clearable
              placeholder="请输入验证码"
              border
            />
            <u-button class="login-inline__btn" shape="circle" :custom-style="codeButtonStyle" @click="sendCode">
              获取验证码
            </u-button>
          </view>
        </u-form-item>
      </u-form>

      <view class="login-tips">
        <text>演示账号说明：</text>
        <text v-if="mode === 'code'">验证码登录：手机号填任意合法号码，验证码输入 `123456` 即可。</text>
        <text v-else>手机号登录：输入合法手机号后可直接进入，适合快速演示查看。</text>
      </view>

      <u-button type="primary" shape="circle" @click="submit">
        {{ mode === "code" ? "验证码登录" : "手机号登录" }}
      </u-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad, type OnLoadOptions } from "@dcloudio/uni-app";
import { useAuth } from "@/hooks/use-auth";
import { isValidMobilePhone, sanitizeMobilePhone } from "@/utils/phone";

type LoginMode = "mobile" | "code";

const phone = ref("");
const code = ref("");
const mode = ref<LoginMode>("mobile");
const redirect = ref("/pages/profile/index");
const { login, finishLoginRedirect } = useAuth();

const modeOptions = [
  { label: "手机号登录", value: "mobile" as LoginMode },
  { label: "验证码登录", value: "code" as LoginMode },
];

const codeButtonStyle = computed(() => ({
  height: "84rpx",
  padding: "0 28rpx",
  color: "#FF6B4A",
  background: "#FFF1EA",
  border: "none",
  fontWeight: "700",
}));

onLoad((options: OnLoadOptions) => {
  redirect.value = String(options?.redirect || "/pages/profile/index");
});

function switchMode(nextMode: LoginMode) {
  mode.value = nextMode;
  if (nextMode === "mobile") {
    code.value = "";
  }
}

function sanitizePhoneInput(value: string) {
  phone.value = sanitizeMobilePhone(value);
}

function validatePhone() {
  if (!isValidMobilePhone(phone.value)) {
    uni.showToast({
      title: "请输入正确手机号",
      icon: "none",
    });
    return false;
  }
  return true;
}

function sendCode() {
  if (!validatePhone()) {
    return;
  }

  uni.showToast({
    title: "演示验证码 123456",
    icon: "none",
  });
}

function submit() {
  if (!validatePhone()) {
    return;
  }

  if (mode.value === "code" && code.value.trim() !== "123456") {
    uni.showToast({
      title: "验证码错误，演示值为123456",
      icon: "none",
    });
    return;
  }

  finishLogin();
}

function quickLogin() {
  phone.value = "13800138000";
  code.value = "123456";
  finishLogin();
}

function finishLogin() {
  login({
    phone: phone.value,
    nickname: "即闪用户",
  });
  uni.showToast({
    title: "登录成功",
    icon: "none",
  });
  setTimeout(() => {
    finishLoginRedirect(redirect.value);
  }, 220);
}
</script>

<style scoped lang="scss">
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.login-card {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
  width: 100%;
  padding: 36rpx 28rpx;
}

.login-hero {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.login-hero__title {
  font-size: 44rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.login-hero__desc {
  font-size: 26rpx;
  line-height: 1.7;
  color: var(--text-secondary);
}

.login-mode {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.login-mode--bottom {
  margin-top: -4rpx;
}

.login-mode__item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 84rpx;
  border-radius: 999rpx;
  font-size: 26rpx;
  font-weight: 700;
  color: var(--text-secondary);
  background: #fff3ec;
}

.login-mode__item--active {
  color: #fff;
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
}

.login-inline {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16rpx;
  width: 100%;
}

.login-inline__btn {
  width: auto;
}

.login-quick-panel {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 28rpx 24rpx;
  border-radius: 28rpx;
  background: linear-gradient(180deg, rgba(255, 241, 234, 0.7), rgba(255, 247, 243, 0.92));
}

.login-quick-panel__hint {
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--text-secondary);
  text-align: center;
}

.login-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.login-divider::before {
  content: "";
  position: absolute;
  inset: 50% 0 auto;
  height: 1px;
  background: rgba(122, 109, 102, 0.16);
}

.login-divider__text {
  position: relative;
  padding: 0 20rpx;
  background: #fffdfb;
  font-size: 22rpx;
  color: var(--text-tertiary);
}

.login-tips {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 20rpx 24rpx;
  border-radius: 24rpx;
  background: #fff7f3;
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--text-secondary);
}

</style>
