<template>
  <view class="page-shell edit-profile-page">
    <view class="card-shell edit-profile-panel">
      <text class="section-title">编辑资料</text>
      <text class="section-desc">头像、昵称、简介都可以在这里统一维护。</text>

      <button class="avatar-field" @tap="changeAvatar">
        <view class="avatar-field__avatar">即</view>
        <view class="avatar-field__info">
          <text class="avatar-field__title">修改头像</text>
          <text class="avatar-field__desc">支持拍照上传或从相册选择</text>
        </view>
      </button>

      <view class="form-field">
        <text class="form-field__label">昵称</text>
        <input v-model="form.name" class="form-field__input" placeholder="请输入昵称" />
      </view>

      <view class="form-field">
        <text class="form-field__label">个性签名</text>
        <textarea v-model="form.bio" class="form-field__textarea" maxlength="80" placeholder="介绍一下你自己" />
      </view>

      <button class="save-btn" @tap="saveProfile">保存资料</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from "vue";

const form = reactive({
  name: "即闪用户",
  bio: "记录生活灵感，分享值得被看见的瞬间。",
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

function saveProfile() {
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

.form-field__input,
.form-field__textarea {
  width: 100%;
  padding: 22rpx 24rpx;
  border-radius: 20rpx;
  background: #fff7f3;
  font-size: 24rpx;
}

.form-field__textarea {
  min-height: 180rpx;
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
