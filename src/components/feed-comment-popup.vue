<template>
  <view v-if="show && post" class="comment-popup" @tap="emit('close')">
    <view class="comment-popup__mask" />
    <view class="comment-popup__sheet" @tap.stop>
      <view class="comment-popup__header">
        <view class="comment-popup__copy">
          <text class="comment-popup__title">评论互动</text>
          <text class="comment-popup__desc">和 {{ post.author }} 一起聊聊，回复、表情和草稿都会保留。</text>
        </view>
        <button class="comment-popup__close" @tap="emit('close')">
          <u-icon name="close" color="#6B625A" size="28" />
        </button>
      </view>

      <scroll-view scroll-y class="comment-popup__body">
        <feed-comment-panel
          :post="post"
          :draft="draft"
          :reply-target="replyTarget"
          :show-emoji="showEmoji"
          :emojis="emojis"
          @reply="emit('reply', $event)"
          @clear-reply="emit('clear-reply')"
          @update:draft="emit('update:draft', $event)"
          @toggle-emoji="emit('toggle-emoji')"
          @append-emoji="emit('append-emoji', $event)"
          @submit="emit('submit')"
        />
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import FeedCommentPanel from "@/components/feed-comment-panel.vue";
import type { FeedPost } from "@/mock/post-data";

defineProps<{
  show: boolean;
  post: FeedPost | null;
  draft: string;
  replyTarget: string;
  showEmoji: boolean;
  emojis: string[];
}>();

const emit = defineEmits<{
  close: [];
  reply: [author: string];
  "clear-reply": [];
  "update:draft": [value: string];
  "toggle-emoji": [];
  "append-emoji": [emoji: string];
  submit: [];
}>();
</script>

<style scoped lang="scss">
.comment-popup {
  position: fixed;
  inset: 0;
  z-index: 90;
}

.comment-popup__mask {
  position: absolute;
  inset: 0;
  background: rgba(34, 26, 21, 0.36);
}

.comment-popup__sheet {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  max-height: 72vh;
  padding: 28rpx 28rpx calc(env(safe-area-inset-bottom) + 28rpx);
  border-radius: 32rpx 32rpx 0 0;
  background: #fffdfb;
  box-shadow: 0 -20rpx 60rpx rgba(34, 26, 21, 0.12);
}

.comment-popup__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.comment-popup__copy {
  min-width: 0;
  flex: 1;
}

.comment-popup__title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.comment-popup__desc {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: var(--text-secondary);
}

.comment-popup__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  padding: 0;
  border-radius: 50%;
  background: #fff4ef;
}

.comment-popup__body {
  max-height: calc(72vh - 108rpx);
  margin-top: 24rpx;
}
</style>
