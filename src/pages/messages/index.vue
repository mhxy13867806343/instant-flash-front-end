<template>
  <view class="page-shell messages-page">
    <view v-if="messages.length" class="messages-list">
      <view v-for="item in messages" :key="item.title" class="message-row card-shell">
        <view class="message-row__head">
          <text class="message-row__title">{{ item.title }}</text>
          <text class="message-row__time">{{ item.time }}</text>
        </view>
        <text class="message-row__content">{{ item.content }}</text>
      </view>
    </view>
    <view v-else class="message-empty card-shell">
      <text class="message-empty__title">暂无消息</text>
      <text class="message-empty__desc">新的评论、点赞和系统通知会展示在这里。</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { fetchMessages } from "@/api/message";
import type { ApiMessage } from "@/types/api";

type MessageItem = {
  title: string;
  time: string;
  content: string;
};

const fallbackMessages: MessageItem[] = [
  { title: "新的评论回复", time: "刚刚", content: "小汐 回复了你的夜市动态，邀请你一起去现场。" },
  { title: "新的点赞", time: "12 分钟前", content: "南风 赞了你的穿搭整理动态。" },
  { title: "系统通知", time: "今天", content: "你的账号资料已完善，可以继续补充头像和个性签名。" },
];

const messages = ref<MessageItem[]>(fallbackMessages);

function normalizeMessages(result: { items?: ApiMessage[] } | ApiMessage[]) {
  const list = Array.isArray(result) ? result : Array.isArray(result.items) ? result.items : [];
  return list
    .map((item) => ({
      title: item.title || item.type || "系统通知",
      time: item.time || item.createdAt || "刚刚",
      content: item.content || item.body || "你有一条新的消息。",
    }))
    .filter((item) => item.title || item.content);
}

onShow(async () => {
  try {
    const result = await fetchMessages();
    const list = normalizeMessages(result);
    messages.value = list.length ? list : [];
  } catch {
    messages.value = fallbackMessages;
  }
});
</script>

<style scoped lang="scss">
.messages-page {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  padding-top: 24rpx;
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

.message-empty {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  margin-top: 24rpx;
  padding: 36rpx 28rpx;
}

.message-empty__title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.message-empty__desc {
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--text-secondary);
}
</style>
