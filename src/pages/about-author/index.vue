<template>
  <view class="page-shell about-author-page">
    <view class="card-shell author-card">
      <view class="author-card__avatar">码</view>
      <text class="author-card__name">mhxy13867806343</text>
      <text class="author-card__desc">全栈开发者 · 即闪项目作者</text>
    </view>

    <view class="card-shell contact-card">
      <text class="contact-card__title">联系方式</text>
      <button
        v-for="item in contacts"
        :key="item.label"
        class="contact-row"
        @tap="handleContact(item)"
      >
        <view class="contact-row__left">
          <text class="contact-row__label">{{ item.label }}</text>
          <text class="contact-row__value">{{ item.value }}</text>
        </view>
        <text class="contact-row__action">{{ item.url ? "↗" : "复制" }}</text>
      </button>
    </view>

    <view class="card-shell links-card">
      <text class="links-card__title">常用链接</text>
      <button
        v-for="link in links"
        :key="link.label"
        class="contact-row"
        @tap="openLink(link.url)"
      >
        <view class="contact-row__left">
          <text class="contact-row__label">{{ link.label }}</text>
          <text class="contact-row__value">{{ link.value }}</text>
        </view>
        <text class="contact-row__action">↗</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { openExternalLink, copyText } from "@/utils/link";

type ContactItem = { label: string; value: string; url?: string; copy?: string };

const contacts: ContactItem[] = [
  { label: "GitHub", value: "github.com/mhxy13867806343", url: "https://github.com/mhxy13867806343" },
  { label: "掘金", value: "juejin.cn/user/1310273588955581", url: "https://juejin.cn/user/1310273588955581" },
  { label: "QQ", value: "869710179", copy: "869710179" },
  { label: "邮箱", value: "869710179@qq.com", copy: "869710179@qq.com" },
  { label: "微信", value: "mutagent", copy: "mutagent" },
];

const links: ContactItem[] = [
  { label: "AI 工具导航", value: "ai-bot.cn", url: "https://ai-bot.cn/" },
];

function openLink(url?: string) {
  if (url) openExternalLink(url);
}

function handleContact(item: ContactItem) {
  if (item.url) {
    openExternalLink(item.url);
    return;
  }
  if (item.copy) {
    copyText(item.copy, `${item.label}已复制`);
  }
}
</script>

<style scoped lang="scss">
.about-author-page {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 24rpx;
}

.author-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  padding: 48rpx 28rpx;
}

.author-card__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
  color: #fff;
  font-size: 56rpx;
  font-weight: 700;
}

.author-card__name {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.author-card__desc {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.contact-card,
.links-card {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 28rpx;
}

.contact-card__title,
.links-card__title {
  margin-bottom: 12rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.contact-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 22rpx 20rpx;
  border-radius: 18rpx;
  background: #fff7f3;
  text-align: left;
}

.contact-row::after {
  border: none;
}

.contact-row__left {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  min-width: 0;
  flex: 1;
}

.contact-row__label {
  font-size: 24rpx;
  font-weight: 600;
  color: var(--text-primary);
}

.contact-row__value {
  font-size: 22rpx;
  color: var(--text-tertiary);
}

.contact-row__action {
  flex-shrink: 0;
  font-size: 22rpx;
  color: var(--brand-primary);
}
</style>
