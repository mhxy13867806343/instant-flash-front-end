<template>
  <view class="page-shell bind-phone-page">
    <view class="card-shell bind-phone-panel">
      <text class="section-title">绑定手机号</text>
      <text class="section-desc">绑定后可用于登录验证、找回账号和接收互动通知。</text>

      <view class="current-phone">
        <text class="current-phone__label">当前已绑定</text>
        <text class="current-phone__value">{{ currentPhoneMask }}</text>
      </view>

      <view class="phone-field">
        <text class="phone-field__label">手机号</text>
        <input v-model="form.phone" class="phone-field__input" type="number" maxlength="11" placeholder="请输入手机号" />
      </view>

      <view class="phone-field">
        <text class="phone-field__label">验证码</text>
        <view class="phone-field__row">
          <input v-model="form.code" class="phone-field__input phone-field__input--code" maxlength="6" placeholder="请输入验证码" />
          <button class="phone-field__code-btn" @tap="sendCode">获取验证码</button>
        </view>
      </view>

      <button class="bind-btn" @tap="bindPhone">确认绑定</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue";

const form = reactive({
  phone: "13800138000",
  code: "",
});

const currentPhoneMask = computed(() => `${form.phone.slice(0, 3)}****${form.phone.slice(-4)}`);

function sendCode() {
  uni.showToast({
    title: "验证码已发送",
    icon: "none",
  });
}

function bindPhone() {
  uni.showToast({
    title: "手机号已绑定",
    icon: "none",
  });
}
</script>

<style scoped lang="scss">
.bind-phone-page {
  display: flex;
  flex-direction: column;
}

.bind-phone-panel {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 32rpx 28rpx;
}

.current-phone {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #fff7f3;
}

.current-phone__label {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.current-phone__value {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.phone-field {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.phone-field__label {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.phone-field__row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.phone-field__input {
  width: 100%;
  min-height: 88rpx;
  padding: 0 24rpx;
  border-radius: 20rpx;
  background: #fff7f3;
  font-size: 24rpx;
}

.phone-field__input--code {
  flex: 1;
  min-width: 0;
}

.phone-field__code-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  height: 88rpx;
  padding: 0 28rpx;
  border-radius: 999rpx;
  background: #fff1ea;
  color: var(--brand-primary);
  font-size: 24rpx;
  font-weight: 700;
}

.bind-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}
</style>
