<template>
  <view class="page-shell messages-page">
    <view class="card-shell messages-panel">
      <text class="section-title">消息中心</text>
      <text class="section-desc">这里集中展示点赞、评论、系统通知等消息，方便统一查看。</text>
    </view>

    <view class="messages-list">
      <view v-for="item in messages" :key="item.title" class="message-row card-shell">
        <view class="message-row__head">
          <text class="message-row__title">{{ item.title }}</text>
          <text class="message-row__time">{{ item.time }}</text>
        </view>
        <text class="message-row__content">{{ item.content }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const messages = [
  { title: "新的评论回复", time: "刚刚", content: "小汐 回复了你的夜市动态，邀请你一起去现场。" },
  { title: "新的点赞", time: "12 分钟前", content: "南风 赞了你的穿搭整理动态。" },
  { title: "系统通知", time: "今天", content: "你的账号资料已完善，可以继续补充头像和个性签名。" },
];
</script>

<style scoped lang="scss">
.messages-page {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.messages-panel {
  padding: 32rpx 28rpx;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.message-row {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  padding: 28rpx 24rpx;
}

.message-row__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.message-row__title {
  font-size: 26rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.message-row__time {
  font-size: 22rpx;
  color: var(--text-tertiary);
}

.message-row__content {
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--text-secondary);
}
</style>
