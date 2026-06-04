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

          <!-- 多行文本 -->
          <textarea
            v-if="field.type === 'textarea'"
            :value="formData[field.fieldKey]"
            class="form-field__textarea"
            :placeholder="field.placeholder || ''"
            placeholder-class="form-field__placeholder"
            @input="onInput(field.fieldKey, $event)"
          />

          <!-- 数字输入 -->
          <view v-else-if="field.type === 'input_number'" class="form-field__number">
            <u-number-box
              :model-value="Number(formData[field.fieldKey]) || 0"
              @change="onNumberChange(field.fieldKey, $event)"
            />
          </view>

          <!-- 下拉选择 -->
          <view
            v-else-if="field.type === 'select' || field.type === 'cascader' || field.type === 'autocomplete'"
            class="form-field__select"
            @tap="openSelect(field)"
          >
            <text :class="['form-field__select-value', { 'form-field__select-value--placeholder': !formData[field.fieldKey] }]">
              {{ formData[field.fieldKey] || field.placeholder || "请选择" }}
            </text>
            <text class="form-field__select-arrow">›</text>
          </view>

          <!-- 多选 -->
          <view v-else-if="field.type === 'checkbox'" class="form-field__group">
            <u-checkbox-group
              :model-value="getArray(field.fieldKey)"
              @change="onCheckboxChange(field.fieldKey, $event)"
            >
              <u-checkbox
                v-for="opt in normalizeOptions(field)"
                :key="opt.value"
                :name="opt.value"
                :label="opt.label"
              />
            </u-checkbox-group>
          </view>

          <!-- 单选 -->
          <view v-else-if="field.type === 'radio'" class="form-field__group">
            <u-radio-group
              :model-value="formData[field.fieldKey]"
              @change="onRadioChange(field.fieldKey, $event)"
            >
              <u-radio
                v-for="opt in normalizeOptions(field)"
                :key="opt.value"
                :name="opt.value"
                :label="opt.label"
              />
            </u-radio-group>
          </view>

          <!-- 开关 -->
          <view v-else-if="field.type === 'switch'" class="form-field__switch">
            <u-switch
              :model-value="formData[field.fieldKey] === 'true' || formData[field.fieldKey] === true"
              @change="onSwitchChange(field.fieldKey, $event)"
            />
          </view>

          <!-- 评分 -->
          <view v-else-if="field.type === 'rate'" class="form-field__rate">
            <u-rate
              :count="5"
              :model-value="Number(formData[field.fieldKey]) || 0"
              @change="onRateChange(field.fieldKey, $event)"
            />
            <text v-if="formData[field.fieldKey]" class="form-field__rate-text">{{ formData[field.fieldKey] }} 分</text>
          </view>

          <!-- 颜色选择 -->
          <view v-else-if="field.type === 'color'" class="form-field__colors">
            <view
              v-for="color in colorPresets"
              :key="color"
              class="form-field__color"
              :class="{ 'form-field__color--active': formData[field.fieldKey] === color }"
              :style="{ background: color }"
              @tap="formData[field.fieldKey] = color"
            />
          </view>

          <!-- 日期 -->
          <picker
            v-else-if="field.type === 'date'"
            mode="date"
            :value="formData[field.fieldKey]"
            @change="onPickerChange(field.fieldKey, $event)"
          >
            <view class="form-field__select">
              <text :class="['form-field__select-value', { 'form-field__select-value--placeholder': !formData[field.fieldKey] }]">
                {{ formData[field.fieldKey] || field.placeholder || "请选择日期" }}
              </text>
              <text class="form-field__select-arrow">›</text>
            </view>
          </picker>

          <!-- 时间 -->
          <picker
            v-else-if="field.type === 'time'"
            mode="time"
            :value="formData[field.fieldKey]"
            @change="onPickerChange(field.fieldKey, $event)"
          >
            <view class="form-field__select">
              <text :class="['form-field__select-value', { 'form-field__select-value--placeholder': !formData[field.fieldKey] }]">
                {{ formData[field.fieldKey] || field.placeholder || "请选择时间" }}
              </text>
              <text class="form-field__select-arrow">›</text>
            </view>
          </picker>

          <!-- 日期时间：日期 + 时间两段 -->
          <view v-else-if="field.type === 'datetime'" class="form-field__datetime">
            <picker mode="date" :value="getDatePart(field.fieldKey)" @change="onDateTimeChange(field.fieldKey, 'date', $event)">
              <view class="form-field__select">
                <text :class="['form-field__select-value', { 'form-field__select-value--placeholder': !getDatePart(field.fieldKey) }]">
                  {{ getDatePart(field.fieldKey) || "选择日期" }}
                </text>
                <text class="form-field__select-arrow">›</text>
              </view>
            </picker>
            <picker mode="time" :value="getTimePart(field.fieldKey)" @change="onDateTimeChange(field.fieldKey, 'time', $event)">
              <view class="form-field__select">
                <text :class="['form-field__select-value', { 'form-field__select-value--placeholder': !getTimePart(field.fieldKey) }]">
                  {{ getTimePart(field.fieldKey) || "选择时间" }}
                </text>
                <text class="form-field__select-arrow">›</text>
              </view>
            </picker>
          </view>

          <!-- 普通输入框 / 手机号 -->
          <input
            v-else
            :value="formData[field.fieldKey]"
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

    <u-action-sheet
      v-model="selectSheetVisible"
      :list="selectSheetList"
      @click="onSelectPick"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { fetchFeedbackForm, submitFeedback, type FeedbackField, type FeedbackForm } from "@/api/feedback";
import { isValidMobilePhone } from "@/utils/phone";

type FieldValue = string | string[] | boolean | number;

const form = ref<FeedbackForm | null>(null);
const loading = ref(true);
const submitting = ref(false);
const formData = reactive<Record<string, FieldValue>>({});

const selectSheetVisible = ref(false);
const activeSelectField = ref<FeedbackField | null>(null);
const colorPresets = ["#FF6B4A", "#FF9F2F", "#2FA36A", "#3D7CFF", "#9B59B6", "#333333"];

const fields = computed(() => {
  const list = form.value?.fields || [];
  return [...list]
    .filter((item) => item.status !== "disabled")
    .sort((a, b) => (a.sort || 0) - (b.sort || 0));
});

function normalizeOptions(field: FeedbackField): { label: string; value: string }[] {
  return (field.options || []).map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : { label: opt.label || opt.value || "", value: opt.value || opt.label || "" }
  );
}

const selectSheetList = computed(() => {
  if (!activeSelectField.value) return [];
  return normalizeOptions(activeSelectField.value).map((opt) => ({ text: opt.label }));
});

onLoad(() => {
  loadForm();
});

async function loadForm() {
  loading.value = true;
  try {
    const result = await fetchFeedbackForm();
    form.value = result;
    (result.fields || []).forEach((field) => {
      if (field.fieldKey in formData) return;
      if (field.type === "checkbox") {
        formData[field.fieldKey] = [];
      } else if (field.type === "switch") {
        formData[field.fieldKey] = false;
      } else {
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

function getArray(key: string): string[] {
  const value = formData[key];
  return Array.isArray(value) ? value : [];
}

function getDatePart(key: string) {
  return String(formData[key] || "").split(" ")[0] || "";
}

function getTimePart(key: string) {
  return String(formData[key] || "").split(" ")[1] || "";
}

function onInput(key: string, event: { detail?: { value?: string } }) {
  formData[key] = event.detail?.value || "";
}

function onPickerChange(key: string, event: { detail?: { value?: string } }) {
  formData[key] = event.detail?.value || "";
}

function onDateTimeChange(key: string, part: "date" | "time", event: { detail?: { value?: string } }) {
  const date = part === "date" ? event.detail?.value || "" : getDatePart(key);
  const time = part === "time" ? event.detail?.value || "" : getTimePart(key);
  formData[key] = `${date} ${time}`.trim();
}

function onRateChange(key: string, value: number) {
  formData[key] = String(value);
}

function onNumberChange(key: string, value: number | { value: number }) {
  formData[key] = String(typeof value === "object" ? value.value : value);
}

function onCheckboxChange(key: string, value: string[]) {
  formData[key] = value;
}

function onRadioChange(key: string, value: string) {
  formData[key] = value;
}

function onSwitchChange(key: string, value: boolean) {
  formData[key] = value;
}

function openSelect(field: FeedbackField) {
  activeSelectField.value = field;
  selectSheetVisible.value = true;
}

function onSelectPick(index: number) {
  const field = activeSelectField.value;
  if (!field) return;
  const opts = normalizeOptions(field);
  formData[field.fieldKey] = opts[index]?.value || "";
  selectSheetVisible.value = false;
}

function isEmpty(value: FieldValue) {
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "boolean") return false;
  return String(value || "").trim() === "";
}

async function handleSubmit() {
  for (const field of fields.value) {
    const value = formData[field.fieldKey];
    if (field.required && isEmpty(value)) {
      const verb = ["select", "cascader", "radio", "checkbox", "time", "date", "datetime", "rate", "color"].includes(field.type)
        ? "请选择"
        : "请填写";
      uni.showToast({ title: `${verb}${field.label}`, icon: "none" });
      return;
    }
    if (field.type === "phone" && !isEmpty(value) && !isValidMobilePhone(String(value))) {
      uni.showToast({ title: "请输入正确的手机号", icon: "none" });
      return;
    }
  }

  submitting.value = true;
  try {
    const knownKeys = ["phone", "title", "content"];
    const data: Record<string, unknown> = {};
    Object.keys(formData).forEach((key) => {
      if (!knownKeys.includes(key)) {
        data[key] = formData[key];
      }
    });

    await submitFeedback({
      phone: formData.phone ? String(formData.phone) : undefined,
      title: formData.title ? String(formData.title) : undefined,
      content: formData.content ? String(formData.content) : undefined,
      data,
    });

    uni.showToast({
      title: form.value?.successMessage || "反馈提交成功",
      icon: "none",
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

.form-field__select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
  border-radius: 20rpx;
  background: #fff7f3;
}

.form-field__select-value {
  font-size: 26rpx;
  color: var(--text-primary);
}

.form-field__select-value--placeholder {
  color: #b7aea7;
}

.form-field__select-arrow {
  font-size: 36rpx;
  color: var(--text-tertiary);
}

.form-field__group {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 16rpx 24rpx;
  border-radius: 20rpx;
  background: #fff7f3;
}

.form-field__switch {
  display: flex;
  align-items: center;
  padding: 8rpx 0;
}

.form-field__number {
  display: flex;
  align-items: center;
  padding: 8rpx 0;
}

.form-field__rate {
  display: flex;
  align-items: center;
  gap: 18rpx;
  height: 72rpx;
  padding: 0 8rpx;
}

.form-field__rate-text {
  font-size: 24rpx;
  color: var(--brand-primary);
  font-weight: 600;
}

.form-field__datetime {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.form-field__colors {
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx;
  padding: 8rpx 0;
}

.form-field__color {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  border: 4rpx solid transparent;
}

.form-field__color--active {
  border-color: var(--text-primary);
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
