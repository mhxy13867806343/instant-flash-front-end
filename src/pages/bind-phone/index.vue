<template>
  <view class="page-shell bind-phone-page">
    <view class="card-shell bind-phone-panel">
      <text class="section-title">更换绑定手机号</text>
      <text class="section-desc">原手机号用于展示当前绑定状态，下面填写新的手机号并完成验证码校验。</text>

      <view class="current-phone">
        <text class="current-phone__label">当前已绑定</text>
        <text class="current-phone__value">{{ currentPhoneMask }}</text>
      </view>

      <u-form :model="form" label-position="top" :border-bottom="false">
        <u-form-item label="新手机号" required>
          <u-input
            v-model="form.phone"
            type="number"
            maxlength="11"
            :clearable="true"
            :border="true"
            placeholder="请输入新手机号"
            input-align="left"
            :custom-style="inputStyle"
            @input="sanitizePhone"
          />
        </u-form-item>

        <u-form-item label="验证码" required>
          <view class="bind-phone-page__code-row">
            <u-input
              v-model="form.code"
              type="number"
              maxlength="6"
              :clearable="true"
              :border="true"
              placeholder="请输入验证码"
              input-align="left"
              :custom-style="inputStyle"
            />
            <u-button
              class="bind-phone-page__code-btn"
              :custom-style="codeButtonStyle"
              :hair-line="false"
              @click="sendCode"
            >
              {{ codeTips }}
            </u-button>
          </view>
        </u-form-item>
      </u-form>

      <u-button
        type="primary"
        shape="circle"
        :custom-style="submitButtonStyle"
        @click="bindPhone"
      >
        确认绑定
      </u-button>
      <u-verification-code ref="codeRef" :seconds="60" @change="handleCodeChange" @end="handleCodeEnd" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";

const form = reactive({
  phone: "",
  code: "",
});

const originalPhone = "13800138000";
const currentPhoneMask = computed(() => `${originalPhone.slice(0, 3)}****${originalPhone.slice(-4)}`);
const codeRef = ref<{ start: () => void; reset: () => void } | null>(null);
const codeTips = ref("获取验证码");
const counting = ref(false);
const lastSentPhone = ref("");

const inputStyle = {
  minHeight: "88rpx",
  padding: "0 24rpx",
  borderRadius: "20rpx",
  backgroundColor: "#FFF7F3",
};

const isValidPhone = computed(() => /^1[3-9]\d{9}$/.test(form.phone));
const canSubmit = computed(() => isValidPhone.value && form.code.trim().length > 0 && form.phone === lastSentPhone.value);
const codeButtonStyle = computed(() => ({
  width: "220rpx",
  height: "88rpx",
  borderRadius: "999rpx",
  background: counting.value || isValidPhone.value ? "#FFF1EA" : "#F3ECE6",
  color: counting.value || isValidPhone.value ? "#FF6B4A" : "#B7ADA5",
  fontSize: "24rpx",
  fontWeight: "700",
}));

const submitButtonStyle = computed(() => ({
  height: "88rpx",
  marginTop: "8rpx",
  fontSize: "28rpx",
  fontWeight: "700",
  opacity: canSubmit.value ? "1" : "0.55",
}));

function sanitizePhone(value: string) {
  form.phone = value.replace(/\D/g, "").slice(0, 11);
}

function validatePhone() {
  if (!form.phone) {
    uni.showToast({
      title: "请输入新手机号",
      icon: "none",
    });
    return false;
  }

  if (!isValidPhone.value) {
    uni.showToast({
      title: "请输入正确的11位手机号",
      icon: "none",
    });
    return false;
  }

  return true;
}

function sendCode() {
  if (counting.value) {
    uni.showToast({
      title: "验证码发送中，请稍后",
      icon: "none",
    });
    return;
  }
  if (!validatePhone()) {
    return;
  }
  lastSentPhone.value = form.phone;
  codeRef.value?.start();
  counting.value = true;
  uni.showToast({
    title: "验证码已发送到新手机号",
    icon: "none",
  });
}

function handleCodeChange(text: string | number) {
  codeTips.value = String(text);
}

function handleCodeEnd() {
  counting.value = false;
  codeTips.value = "重新获取";
}

function bindPhone() {
  if (!validatePhone()) return;
  if (form.phone !== lastSentPhone.value) {
    uni.showToast({
      title: "请先给当前新手机号获取验证码",
      icon: "none",
    });
    return;
  }
  if (!form.code) {
    uni.showToast({
      title: "请输入验证码",
      icon: "none",
    });
    return;
  }
  if (!canSubmit.value) {
    uni.showToast({
      title: "请先完成验证码校验",
      icon: "none",
    });
    return;
  }
  uni.showToast({
    title: "新手机号已绑定",
    icon: "none",
  });
}

watch(
  () => form.phone,
  (value, oldValue) => {
    if (!oldValue || value === oldValue) {
      return;
    }

    if (counting.value && value !== lastSentPhone.value) {
      codeRef.value?.reset();
      counting.value = false;
      codeTips.value = "获取验证码";
      form.code = "";
      uni.showToast({
        title: "手机号已变更，请重新获取验证码",
        icon: "none",
      });
    }
  }
);
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

.bind-phone-page__code-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220rpx;
  gap: 16rpx;
  width: 100%;
}

.bind-phone-page__code-btn {
  display: flex;
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
</style>
