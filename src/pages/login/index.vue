<template>
  <view class="page-shell login-page">
    <view class="card-shell login-card">
      <view class="login-hero">
        <text class="login-hero__title">欢迎回来</text>
        <text class="login-hero__desc">登录后即可发布动态、查看互动消息，也能继续管理你的评论和草稿。</text>
      </view>

      <view v-if="mode === 'quick'" class="login-quick-panel">
        <view class="login-quick-panel__badge">推荐方式</view>
        <u-button type="primary" shape="circle" @click="quickLogin">微信一键登录</u-button>
        <text class="login-quick-panel__hint">通过微信授权快速登录，更适合移动端一键进入即闪。</text>
      </view>

      <view v-else class="login-form-panel">
        <text class="login-form-panel__title">验证码登录</text>
        <text class="login-form-panel__desc">
          填写手机号并输入验证码完成登录。
        </text>

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
          <text>验证码登录：手机号填任意合法号码，验证码输入 `123456` 即可。</text>
        </view>

        <u-button type="primary" shape="circle" @click="submit">
          验证码登录
        </u-button>
      </view>

      <view v-if="modeOptions.length > 1" class="login-switcher">
        <button
          v-for="item in modeOptions"
          :key="item.value"
          class="login-switcher__item"
          :class="{ 'login-switcher__item--active': mode === item.value }"
          @tap="switchMode(item.value)"
        >
          {{ item.label }}
        </button>
      </view>

      <view class="login-agreements">
        <button class="login-agreements__item" @tap="goAgreement('/pages/privacy/index')">隐私协议</button>
        <text class="login-agreements__dot">|</text>
        <button class="login-agreements__item" @tap="goAgreement('/pages/user-agreement/index')">用户协议</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useAuth } from "@/hooks/use-auth";
import { isValidMobilePhone, sanitizeMobilePhone } from "@/utils/phone";

type LoginMode = "quick" | "code";

let isH5 = false;
// #ifdef H5
isH5 = true;
// #endif

const phone = ref("");
const code = ref("");
const mode = ref<LoginMode>(isH5 ? "code" : "quick");
const redirect = ref("/pages/profile/index");
const { login, finishLoginRedirect, consumePendingRedirect } = useAuth();

const modeOptions = isH5
  ? [{ label: "验证码登录", value: "code" as LoginMode }]
  : [
      { label: "微信登录", value: "quick" as LoginMode },
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

onLoad(() => {
  redirect.value = consumePendingRedirect();
});

function switchMode(nextMode: LoginMode) {
  mode.value = nextMode;
  if (nextMode !== "code") {
    code.value = "";
  }
}

function goAgreement(url: string) {
  uni.navigateTo({ url });
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
  if (mode.value === "quick") {
    quickLogin();
    return;
  }

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
  gap: 24rpx;
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
  align-items: stretch;
  padding: 32rpx 24rpx;
  border-radius: 32rpx;
  background: linear-gradient(180deg, rgba(255, 241, 234, 0.88), rgba(255, 247, 243, 0.96));
}

.login-quick-panel__badge {
  align-self: center;
  height: 44rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  line-height: 44rpx;
  font-weight: 700;
  color: var(--brand-primary);
  background: rgba(255, 107, 74, 0.12);
}

.login-quick-panel__hint {
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--text-secondary);
  text-align: center;
}

.login-form-panel {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
  padding: 28rpx 24rpx;
  border-radius: 28rpx;
  background: #fff9f6;
}

.login-form-panel__title {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.login-form-panel__desc {
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--text-secondary);
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

.login-switcher {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  padding-top: 4rpx;
}

.login-switcher__item {
  position: relative;
  padding: 8rpx 4rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: var(--text-tertiary);
  background: transparent;
}

.login-switcher__item--active {
  color: var(--brand-primary);
}

.login-switcher__item--active::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -4rpx;
  height: 4rpx;
  border-radius: 999rpx;
  background: var(--brand-primary);
}

.login-agreements {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  padding-bottom: 4rpx;
}

.login-agreements__item,
.login-agreements__dot {
  font-size: 22rpx;
  color: var(--text-tertiary);
}

</style>
