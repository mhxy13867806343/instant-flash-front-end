<template>
  <view class="page-shell edit-profile-page">
    <view class="card-shell edit-profile-panel">
      <text class="section-title">编辑资料</text>
      <text class="section-desc">头像、昵称、性别和简介都可以在这里统一维护。</text>

      <button class="avatar-field" @tap="changeAvatar">
        <view class="avatar-field__avatar">即</view>
        <view class="avatar-field__info">
          <text class="avatar-field__title">修改头像</text>
          <text class="avatar-field__desc">支持拍照上传或从相册选择</text>
        </view>
      </button>

      <view class="form-field">
        <text class="form-field__label">昵称</text>
        <u-input
          v-model="form.name"
          :clearable="true"
          :border="true"
          maxlength="16"
          placeholder="请输入昵称"
          input-align="left"
          :custom-style="inputStyle"
        />
      </view>

      <view class="form-field">
        <text class="form-field__label">性别</text>
        <view class="select-field" @tap="selectGender">
          <text class="select-field__value">{{ form.gender }}</text>
          <text class="select-field__arrow">></text>
        </view>
      </view>

      <view class="form-field">
        <text class="form-field__label">个性签名</text>
        <textarea
          v-model="form.bio"
          class="form-field__textarea"
          maxlength="80"
          placeholder="介绍一下你自己"
          placeholder-class="form-field__placeholder"
        />
      </view>

      <button class="save-btn" @tap="saveProfile">保存资料</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useAuth } from "@/hooks/use-auth";

const genderOptions = ["保密", "男", "女"] as const;
const { profile, updateProfile } = useAuth();
const inputStyle = {
  minHeight: "88rpx",
  padding: "0 24rpx",
  borderRadius: "20rpx",
  backgroundColor: "#FFF7F3",
};

const form = reactive({
  name: profile.value.nickname,
  gender: profile.value.gender,
  bio: profile.value.bio,
});

function changeAvatar() {
  uni.showActionSheet({
    itemList: ["拍照上传", "从相册选择"],
    success: () => {
      uni.showToast({
        title: "已打开头像修改入口",
        icon: "none",
      });
    },
  });
}

function selectGender() {
  uni.showActionSheet({
    itemList: [...genderOptions],
    success: ({ tapIndex }) => {
      form.gender = genderOptions[tapIndex] || form.gender;
    },
  });
}

function saveProfile() {
  const nickname = form.name.trim();
  if (!nickname) {
    uni.showToast({
      title: "请输入昵称",
      icon: "none",
    });
    return;
  }

  updateProfile({
    nickname,
    gender: form.gender,
    bio: form.bio,
  });
  uni.showToast({
    title: "资料已保存",
    icon: "none",
  });
}
</script>

<style scoped lang="scss">
.edit-profile-page {
  display: flex;
  flex-direction: column;
}

.edit-profile-panel {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 32rpx 28rpx;
}

.avatar-field {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #fff7f3;
}

.avatar-field__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
  color: #fff;
  font-size: 38rpx;
  font-weight: 700;
}

.avatar-field__info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  text-align: left;
}

.avatar-field__title {
  font-size: 26rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.avatar-field__desc {
  font-size: 22rpx;
  color: var(--text-tertiary);
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

.form-field__textarea {
  width: 100%;
  padding: 22rpx 24rpx;
  min-height: 180rpx;
  border-radius: 20rpx;
  background: #fff7f3;
  font-size: 24rpx;
}

.form-field__placeholder {
  color: #b7aea7;
}

.select-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 88rpx;
  padding: 0 24rpx;
  border-radius: 20rpx;
  background: #fff7f3;
}

.select-field__value {
  font-size: 24rpx;
  color: var(--text-primary);
}

.select-field__arrow {
  font-size: 24rpx;
  color: var(--text-tertiary);
}

.save-btn {
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
