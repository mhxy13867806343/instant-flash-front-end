<template>
  <view class="page-shell safe-bottom home-page">
    <view class="hero card-shell">
      <view class="hero-top">
        <view>
          <text class="hero-title">即闪</text>
          <text class="hero-subtitle">用更轻的方式，发现身边的即时灵感</text>
        </view>
        <u-tag text="uView" type="warning" plain shape="circle" />
      </view>

      <u-search
        v-model="keyword"
        placeholder="搜索话题、内容、用户"
        :show-action="false"
        bg-color="#FFF7F3"
        placeholder-color="#9B948E"
      />

      <view class="hero-actions">
        <u-button type="primary" shape="circle" text="发布内容" />
        <u-button color="#FFF1EA" shape="circle" text="查看热门" />
      </view>
    </view>

    <view class="section-block">
      <view class="section-head">
        <text class="section-title">热门话题</text>
        <text class="section-desc">先用组件搭出首页结构，后面再接真实数据。</text>
      </view>
      <view class="topic-row">
        <u-tag
          v-for="topic in topics"
          :key="topic"
          :text="topic"
          plain
          shape="circle"
          type="primary"
        />
      </view>
    </view>

    <view class="feed-list">
      <view v-for="card in cards" :key="card.title" class="feed-card card-shell">
        <view class="feed-card__meta">
          <view>
            <text class="feed-card__title">{{ card.title }}</text>
            <text class="feed-card__desc">{{ card.desc }}</text>
          </view>
          <u-tag :text="card.badge" type="success" plain shape="circle" />
        </view>
        <view class="feed-card__footer">
          <text class="feed-card__stats">{{ card.stats }}</text>
          <u-button size="mini" type="primary" shape="circle" text="去看看" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";

const keyword = ref("");

const topics = ["同城发现", "即时分享", "周末去哪", "校园灵感"];

const cards = [
  {
    title: "今晚附近有什么新鲜事",
    desc: "基于当前位置，快速刷到身边正在发生的内容。",
    badge: "推荐",
    stats: "2.3k 浏览",
  },
  {
    title: "把灵感用 30 秒发出去",
    desc: "图文入口、快捷发布、轻互动，首页先把节奏感做出来。",
    badge: "新功能",
    stats: "128 条互动",
  },
  {
    title: "个人内容也能被轻松看见",
    desc: "后续会接点赞、评论、分享和个人主页联动。",
    badge: "待联调",
    stats: "持续迭代中",
  },
];
</script>

<style scoped lang="scss">
.home-page {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.hero {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 32rpx 28rpx;
}

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
}

.hero-title {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.hero-subtitle {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  line-height: 1.6;
  color: var(--text-secondary);
}

.hero-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.section-block {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.section-head {
  padding: 0 8rpx;
}

.topic-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.feed-card {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 28rpx;
}

.feed-card__meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.feed-card__title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-primary);
}

.feed-card__desc {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  line-height: 1.7;
  color: var(--text-secondary);
}

.feed-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.feed-card__stats {
  font-size: 24rpx;
  color: var(--text-tertiary);
}
</style>
