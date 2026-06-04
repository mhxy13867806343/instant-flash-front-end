<template>
  <view class="page-shell repositories-page">
    <view class="card-shell repo-intro">
      <text class="repo-intro__title">项目仓库</text>
      <text class="repo-intro__desc">即闪项目的前端、后端与后台管理系统代码仓库，欢迎查看与交流。</text>
    </view>

    <view
      v-for="repo in repos"
      :key="repo.url"
      class="card-shell repo-card"
    >
      <view class="repo-card__head">
        <view class="repo-card__icon" :style="{ background: repo.color }">{{ repo.tag }}</view>
        <view class="repo-card__meta">
          <text class="repo-card__name">{{ repo.name }}</text>
          <text class="repo-card__stack">{{ repo.stack }}</text>
        </view>
      </view>
      <text class="repo-card__url">{{ repo.url }}</text>
      <view class="repo-card__actions">
        <button class="repo-card__btn repo-card__btn--primary" @tap="openLink(repo.url)">打开仓库</button>
        <button class="repo-card__btn" @tap="copyLink(repo.url)">复制链接</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { openExternalLink, copyText } from "@/utils/link";

const repos = [
  {
    name: "即闪 · 前端（用户端）",
    stack: "uni-app · Vue 3 · TypeScript",
    url: "https://gitee.com/fangjiayu/instant-flash-front-end",
    tag: "前",
    color: "linear-gradient(135deg, #ff8d5f, #ff6b4a)",
  },
  {
    name: "即闪 · 后端",
    stack: "Python · FastAPI",
    url: "https://gitee.com/fangjiayu/instant-flash-backend",
    tag: "后",
    color: "linear-gradient(135deg, #4f9dff, #3d7cff)",
  },
  {
    name: "即闪 · 后台管理系统",
    stack: "Vue 3 · Element Plus",
    url: "https://gitee.com/fangjiayu/ji-shan-backstage-management-system",
    tag: "管",
    color: "linear-gradient(135deg, #51c98a, #2fa36a)",
  },
];

function openLink(url: string) {
  openExternalLink(url);
}

function copyLink(url: string) {
  copyText(url, "仓库地址已复制");
}
</script>

<style scoped lang="scss">
.repositories-page {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 24rpx;
}

.repo-intro {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding: 32rpx 28rpx;
}

.repo-intro__title {
  font-size: 38rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.repo-intro__desc {
  font-size: 26rpx;
  line-height: 1.7;
  color: var(--text-secondary);
}

.repo-card {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 28rpx;
}

.repo-card__head {
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.repo-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
}

.repo-card__meta {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  min-width: 0;
  flex: 1;
}

.repo-card__name {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.repo-card__stack {
  font-size: 22rpx;
  color: var(--text-tertiary);
}

.repo-card__url {
  padding: 18rpx 20rpx;
  border-radius: 16rpx;
  background: #fff7f3;
  font-size: 22rpx;
  color: var(--text-secondary);
  word-break: break-all;
}

.repo-card__actions {
  display: flex;
  gap: 16rpx;
}

.repo-card__btn {
  flex: 1;
  height: 76rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: var(--brand-primary);
  background: #fff1ea;
  line-height: 76rpx;
}

.repo-card__btn::after {
  border: none;
}

.repo-card__btn--primary {
  color: #fff;
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
}
</style>
