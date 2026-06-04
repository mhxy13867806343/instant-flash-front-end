<template>
  <view class="page-shell feedback-page">
    <view class="card-shell feedback-panel">
      <text class="section-title">{{ form?.title || "意见反馈" }}</text>
      <text class="section-desc">{{ form?.description || "请填写下面的内容，我们会尽快处理。" }}</text>

      <view v-if="loading" class="feedback-loading">
        <text class="feedback-loading__text">表单加载中...</text>
      </view>

      <view v-else class="feedback-form">
        <view v-for="field in fields" :key="field.fieldId" class="form-field">
          <text class="form-field__label">
            {{ field.label }}
            <text v-if="field.required" class="form-field__required">*</text>
          </text>

          <textarea
            v-if="field.type === 'textarea'"
            :value="getValue(field.fieldKey)"
            class="form-field__textarea"
            :placeholder="field.placeholder || ''"
            placeholder-class="form-field__placeholder"
            @input="onInput(field.fieldKey, $event)"
          />

          <input
            v-else
            :value="getValue(field.fieldKey)"
            class="form-field__input"
            :type="field.type === 'phone' ? 'number' : 'text'"
            :maxlength="field.type === 'phone' ? 11 : 200"
            :placeholder="field.placeholder || ''"
            placeholder-class="form-field__placeholder"
            @input="onInput(field.fieldKey, $event)"
          />
        </view>

        <button class="feedback-submit" :disabled="submitting" @tap="handleSubmit">
          {{ submitting ? "提交中..." : form?.submitButtonText || "提交反馈" }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { fetchFeedbackForm, submitFeedback, type FeedbackForm } from "@/api/feedback";
import { isValidMobilePhone } from "@/utils/phone";

const form = ref<FeedbackForm | null>(null);
const loading = ref(true);
const submitting = ref(false);
const formData = reactive<Record<string, string>>({});

const fields = computed(() => {
  const list = form.value?.fields || [];
  return [...list]
    .filter((item) => item.status !== "disabled")
    .sort((a, b) => (a.sort || 0) - (b.sort || 0));
});

onLoad(() => {
  loadForm();
});

async function loadForm() {
  loading.value = true;
  try {
    const result = await fetchFeedbackForm();
    form.value = result;
    // 初始化字段值
    (result.fields || []).forEach((field) => {
      if (!(field.fieldKey in formData)) {
        formData[field.fieldKey] = "";
      }
    });
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : "表单加载失败",
      icon: "none",
    });
  } finally {
    loading.value = false;
  }
}

function getValue(key: string) {
  return formData[key] || "";
}

function onInput(key: string, event: { detail?: { value?: string } }) {
  formData[key] = event.detail?.value || "";
}

async function handleSubmit() {
  // 校验必填
  for (const field of fields.value) {
    const value = (formData[field.fieldKey] || "").trim();
    if (field.required && !value) {
      uni.showToast({ title: `请填写${field.label}`, icon: "none" });
      return;
    }
    if (field.type === "phone" && value && !isValidMobilePhone(value)) {
      uni.showToast({ title: "请输入正确的手机号", icon: "none" });
      return;
    }
  }

  submitting.value = true;
  try {
    // phone/title/content 直接传，其余放 data
    const knownKeys = ["phone", "title", "content"];
    const data: Record<string, unknown> = {};
    Object.keys(formData).forEach((key) => {
      if (!knownKeys.includes(key)) {
        data[key] = formData[key];
      }
    });

    await submitFeedback({
      phone: formData.phone || undefined,
      title: formData.title || undefined,
      content: formData.content || undefined,
      data,
    });

    uni.showToast({
      title: form.value?.successMessage || "反馈提交成功",
      icon: "none",
    });

    // 清空表单
    Object.keys(formData).forEach((key) => {
      formData[key] = "";
    });

    setTimeout(() => {
      uni.navigateBack();
    }, 1200);
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : "提交失败，请重试",
      icon: "none",
    });
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped lang="scss">
.feedback-page {
  display: flex;
  flex-direction: column;
}

.feedback-panel {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 32rpx 28rpx;
}

.feedback-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
}

.feedback-loading__text {
  font-size: 24rpx;
  color: var(--text-tertiary);
}

.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.form-field__label {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.form-field__required {
  color: #ff5a36;
}

.form-field__input {
  height: 88rpx;
  padding: 0 24rpx;
  border-radius: 20rpx;
  background: #fff7f3;
  font-size: 26rpx;
  color: var(--text-primary);
}

.form-field__textarea {
  width: 100%;
  min-height: 200rpx;
  padding: 22rpx 24rpx;
  border-radius: 20rpx;
  background: #fff7f3;
  font-size: 26rpx;
  color: var(--text-primary);
}

.form-field__placeholder {
  color: #b7aea7;
}

.feedback-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  margin-top: 8rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}

.feedback-submit[disabled] {
  opacity: 0.6;
}
</style>
