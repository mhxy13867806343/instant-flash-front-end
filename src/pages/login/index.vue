<template>
  <view class="page-shell login-page">
    <view class="login-bg login-bg--top" />
    <view class="login-bg login-bg--bottom" />

    <view class="card-shell login-card">
      <view class="login-head">
        <view class="login-head__emblem">
          <text class="login-head__emblem-text">即</text>
        </view>
        <text class="login-head__title">即闪登录</text>
        <text class="login-head__desc">{{ mode === "quick" ? "微信授权后直接进入" : "请输入手机号和验证码" }}</text>
      </view>

      <view class="login-panel">
        <view class="login-panel__head">
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
        </view>

        <view v-if="mode === 'quick'" class="login-quick-panel">
          <view class="login-quick-panel__qr">
            <view class="login-quick-panel__qr-box">
              <u-icon name="weixin-fill" color="#22c45e" size="124" />
            </view>
            <text class="login-quick-panel__hint">微信一键授权登录</text>
          </view>
          <u-button type="primary" shape="circle" :custom-style="primaryButtonStyle" @click="quickLogin">微信一键登录</u-button>
        </view>

        <view v-else class="login-form-panel">
          <u-form label-position="top">
            <u-form-item label="手机号" :border-bottom="false">
              <u-input
                v-model="phone"
                type="number"
                maxlength="11"
                clearable
                placeholder="请输入手机号"
                border
                :custom-style="fieldStyle"
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
                  :custom-style="fieldStyle"
                />
                <u-button class="login-inline__btn" shape="circle" :custom-style="codeButtonStyle" @click="sendCode">
                  获取验证码
                </u-button>
              </view>
            </u-form-item>
          </u-form>

          <text class="login-form-panel__hint">演示验证码：`123456`</text>

          <u-button type="primary" shape="circle" :custom-style="primaryButtonStyle" @click="submit">验证码登录</u-button>
        </view>

        <view class="login-agreements">
          <text class="login-agreements__text">登录即表示你已阅读并同意</text>
          <button class="login-agreements__item" @tap="goAgreement('/pages/privacy/index')">隐私协议</button>
          <text class="login-agreements__dot">与</text>
          <button class="login-agreements__item" @tap="goAgreement('/pages/user-agreement/index')">用户协议</button>
        </view>
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
const previewQuick = ref(false);
const mode = ref<LoginMode>(isH5 ? "code" : "quick");
const redirect = ref("/pages/profile/index");
const { login, finishLoginRedirect, consumePendingRedirect } = useAuth();

const modeOptions = computed(() =>
  isH5 && !previewQuick.value
    ? [{ label: "验证码登录", value: "code" as LoginMode }]
    : [
        { label: "微信登录", value: "quick" as LoginMode },
        { label: "验证码登录", value: "code" as LoginMode },
      ]
);

const fieldStyle = computed(() => ({
  minHeight: "92rpx",
  padding: "0 22rpx",
  borderRadius: "22rpx",
  background: "#FFF8F4",
}));

const codeButtonStyle = computed(() => ({
  height: "84rpx",
  padding: "0 30rpx",
  color: "#8F3D2B",
  background: "#F7DDD4",
  border: "1rpx solid rgba(196, 125, 101, 0.28)",
  fontWeight: "700",
  boxShadow: "none",
}));

const primaryButtonStyle = computed(() => ({
  height: "92rpx",
  fontWeight: "700",
  fontSize: "28rpx",
  background: "linear-gradient(135deg, #FF7B58 0%, #FF5A36 100%)",
  boxShadow: "0 18rpx 40rpx rgba(255, 107, 74, 0.22)",
}));

onLoad((options) => {
  redirect.value = consumePendingRedirect();
  if (isH5 && options?.preview === "quick") {
    previewQuick.value = true;
    mode.value = "quick";
  }
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
  min-height: 100vh;
  padding-top: 44rpx;
  overflow: hidden;
  position: relative;
}

.login-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(10rpx);
  pointer-events: none;
}

.login-bg--top {
  top: -120rpx;
  right: -70rpx;
  width: 360rpx;
  height: 360rpx;
  background: radial-gradient(circle, rgba(255, 132, 102, 0.24) 0%, rgba(255, 132, 102, 0) 72%);
}

.login-bg--bottom {
  left: -120rpx;
  bottom: 120rpx;
  width: 420rpx;
  height: 420rpx;
  background: radial-gradient(circle, rgba(255, 220, 192, 0.38) 0%, rgba(255, 220, 192, 0) 72%);
}

.login-card {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28rpx;
  width: 100%;
  max-width: 720rpx;
  margin: auto;
  padding: 52rpx 34rpx 36rpx;
  border-radius: 40rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(255, 249, 245, 0.98)),
    #fff;
}

.login-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  width: 100%;
}

.login-head__emblem {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 144rpx;
  height: 144rpx;
  border-radius: 36rpx;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0) 58%),
    linear-gradient(145deg, #ff936f, #ff5a36);
  box-shadow:
    inset 0 1rpx 0 rgba(255, 255, 255, 0.36),
    0 20rpx 44rpx rgba(255, 107, 74, 0.2);
}

.login-head__emblem-text {
  font-size: 64rpx;
  font-weight: 800;
  color: #fff;
}

.login-head__title {
  font-size: 44rpx;
  font-weight: 800;
  color: #352925;
}

.login-head__desc {
  font-size: 24rpx;
  color: #6f625b;
}

.login-panel {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  width: 100%;
}

.login-panel__head {
  display: flex;
  justify-content: center;
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
  gap: 28rpx;
}

.login-quick-panel__qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.login-quick-panel__qr-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 340rpx;
  height: 340rpx;
  margin: 0 auto;
  border-radius: 28rpx;
  background:
    linear-gradient(180deg, #ffffff, #fff9f5),
    #fff;
  border: 1rpx solid rgba(235, 226, 218, 0.9);
  box-shadow: 0 24rpx 50rpx rgba(180, 119, 93, 0.08);
}

.login-quick-panel__hint {
  font-size: 24rpx;
  line-height: 1.7;
  color: #625751;
}

.login-form-panel {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.login-form-panel__hint {
  font-size: 24rpx;
  text-align: center;
  color: #6e625b;
}

.login-switcher {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 10rpx;
  padding: 8rpx;
  border-radius: 999rpx;
  background: #fff5f0;
  border: 1rpx solid rgba(255, 107, 74, 0.08);
}

.login-switcher__item {
  position: relative;
  min-width: 156rpx;
  height: 64rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  font-size: 23rpx;
  font-weight: 700;
  color: #756962;
  background: transparent;
}

.login-switcher__item--active {
  color: #b24f38;
  background: #fff;
  box-shadow: 0 10rpx 22rpx rgba(198, 137, 114, 0.12);
}

.login-agreements {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding-top: 8rpx;
}

.login-agreements__text {
  font-size: 22rpx;
  color: #877b75;
}

.login-agreements__item,
.login-agreements__dot {
  font-size: 22rpx;
  color: #756962;
}

.login-agreements__item {
  color: #5f514a;
  text-decoration: underline;
}

::v-deep(.u-form-item__body__left__content__label) {
  font-size: 24rpx;
  font-weight: 700;
  color: #5f524b;
}

::v-deep(.u-input) {
  border-color: rgba(214, 171, 156, 0.48) !important;
}

::v-deep(.u-input__input) {
  font-size: 26rpx;
  color: #3b302b;
}

::v-deep(.u-input__placeholder) {
  color: #9e918a !important;
}
</style>
