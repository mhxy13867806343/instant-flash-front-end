<template>
  <view class="comment-panel">
    <feed-comment-state :count="post.commentList.length" />

    <view v-if="post.commentList.length" class="comment-panel__list">
      <view v-for="item in post.commentList" :key="item.id" class="comment-panel__item">
        <view class="comment-panel__head">
          <view class="comment-panel__meta">
            <text class="comment-panel__name">{{ item.author }}</text>
            <text class="comment-panel__time">{{ item.time }}</text>
          </view>
          <button class="comment-panel__reply" @tap.stop="emit('reply', item.author)">
            <image
              class="comment-panel__reply-icon"
              :src="replyTarget === item.author ? '/static/opt/read-selected.png' : '/static/opt/read.png'"
              mode="aspectFit"
            />
          </button>
        </view>
        <text v-if="item.replyTo" class="comment-panel__replyto">回复 @{{ item.replyTo }}</text>
        <text class="comment-panel__content">{{ item.content }}</text>
      </view>
    </view>

    <view v-if="replyTarget" class="comment-panel__replybar">
      <text class="comment-panel__replybar-text">正在回复 @{{ replyTarget }}</text>
      <button class="comment-panel__replybar-cancel" @tap.stop="emit('clear-reply')">
        <image class="comment-panel__replybar-cancel-icon" src="/static/opt/close.png" mode="aspectFit" />
      </button>
    </view>

    <view class="comment-panel__editor">
      <input
        :value="draft"
        class="comment-panel__input"
        :placeholder="replyTarget ? `回复 @${replyTarget}` : '说点什么...'"
        placeholder-class="comment-panel__placeholder"
        @input="handleInput"
      />
      <button class="comment-panel__emoji-btn" @tap.stop="emit('toggle-emoji')">😊</button>
      <button class="comment-panel__submit" @tap.stop="emit('submit')">发送</button>
    </view>

    <view v-if="showEmoji" class="comment-panel__emoji">
      <button
        v-for="emoji in emojis"
        :key="emoji"
        class="comment-panel__emoji-item"
        @tap.stop="emit('append-emoji', emoji)"
      >
        {{ emoji }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import FeedCommentState from "@/components/feed-comment-state.vue";
import type { FeedPost } from "@/mock/post-data";

const props = defineProps<{
  post: FeedPost;
  draft: string;
  replyTarget: string;
  showEmoji: boolean;
  emojis: string[];
}>();

const emit = defineEmits<{
  reply: [author: string];
  "clear-reply": [];
  "update:draft": [value: string];
  "toggle-emoji": [];
  "append-emoji": [emoji: string];
  submit: [];
}>();

function handleInput(event: InputEvent & { detail?: { value?: string } }) {
  emit("update:draft", event.detail?.value || "");
}
</script>

<style scoped lang="scss">
.comment-panel {
  padding-top: 8rpx;
  border-top: 1rpx solid rgba(235, 226, 218, 0.9);
}

.comment-panel__list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.comment-panel__item {
  padding: 20rpx 22rpx;
  border-radius: 20rpx;
  background: #fff7f3;
}

.comment-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.comment-panel__meta {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.comment-panel__name {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.comment-panel__time {
  font-size: 22rpx;
  color: var(--text-tertiary);
}

.comment-panel__reply {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  padding: 0;
  border-radius: 50%;
  background: rgba(255, 107, 74, 0.08);
}

.comment-panel__reply-icon {
  width: 32rpx;
  height: 32rpx;
}

.comment-panel__replyto {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #5d7aa6;
}

.comment-panel__content {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--text-secondary);
}

.comment-panel__replybar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-top: 16rpx;
  padding: 16rpx 20rpx;
  border-radius: 18rpx;
  background: rgba(255, 107, 74, 0.08);
}

.comment-panel__replybar-text {
  min-width: 0;
  flex: 1;
  font-size: 22rpx;
  color: var(--brand-primary);
  font-weight: 700;
}

.comment-panel__replybar-cancel {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52rpx;
  height: 52rpx;
  padding: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
}

.comment-panel__replybar-cancel-icon {
  width: 22rpx;
  height: 22rpx;
}

.comment-panel__editor {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 16rpx;
}

.comment-panel__input {
  flex: 1;
  height: 76rpx;
  min-width: 0;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: #fff7f3;
  font-size: 24rpx;
}

.comment-panel__placeholder {
  color: #9b948e;
}

.comment-panel__emoji-btn {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: #fff7f3;
  font-size: 30rpx;
}

.comment-panel__submit {
  flex-shrink: 0;
  height: 76rpx;
  padding: 0 28rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
}

.comment-panel__emoji {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
  padding: 18rpx;
  border-radius: 20rpx;
  background: #fff7f3;
}

.comment-panel__emoji-item {
  width: 72rpx;
  height: 72rpx;
  border-radius: 18rpx;
  background: #fff;
  font-size: 32rpx;
}
</style>
