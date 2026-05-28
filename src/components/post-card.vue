<template>
  <view class="post-card card-shell" :class="{ 'post-card--detail': mode === 'detail' }">
    <view class="post-main" @tap="handleDetail">
      <view class="post-head">
        <view class="author-avatar">{{ avatarText }}</view>
        <view class="author-meta">
          <view class="author-line">
            <text class="author-name">{{ post.author }}</text>
            <text class="author-tag">{{ post.authorTag }}</text>
          </view>
          <text class="post-meta">{{ post.time }} · {{ post.location }}</text>
        </view>
      </view>

      <view class="post-body">
        <text class="post-content">{{ post.content }}</text>
        <view class="topic-row">
          <button
            v-for="topic in post.topics"
            :key="topic"
            class="topic-chip"
            @tap.stop="emit('topic', topic)"
          >
            #{{ topic }}
          </button>
        </view>
      </view>

      <view v-if="post.media.length" class="media-grid" :class="`media-grid--${mediaColumns}`">
        <view
          v-for="(item, index) in post.media"
          :key="item"
          class="media-cell"
          @tap.stop="openMediaPreview(index)"
        >
          <text class="media-label">{{ item }}</text>
        </view>
      </view>
    </view>

    <view v-if="showActions" class="post-actions">
      <button class="action-btn" @tap.stop="emit('like', post.id)">
        <u-icon :name="post.liked ? 'heart-fill' : 'heart'" :color="post.liked ? '#FF6B4A' : '#6B625A'" size="34" />
        <text class="action-text">{{ likeText }}</text>
      </button>
      <button class="action-btn" @tap.stop="emit('comment', post.id)">
        <u-icon name="chat" color="#6B625A" size="34" />
        <text class="action-text">{{ commentText }}</text>
      </button>
      <button class="action-btn" @tap.stop="emit('share', post.id)">
        <u-icon name="share" color="#6B625A" size="34" />
        <text class="action-text">{{ shareText }}</text>
      </button>
    </view>

    <view class="post-extra" @tap.stop>
      <slot />
    </view>

    <media-preview-popup
      :show="previewVisible"
      :items="previewAssets"
      :current="previewIndex"
      @close="closePreview"
      @update:current="previewIndex = $event"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import MediaPreviewPopup, { type MediaPreviewAsset } from "@/components/media-preview-popup.vue";
import type { FeedPost } from "@/mock/post-data";
import { formatCount } from "@/utils/number";

const props = withDefaults(
  defineProps<{
    post: FeedPost;
    mode?: "list" | "detail";
    showActions?: boolean;
  }>(),
  {
    mode: "list",
    showActions: true,
  }
);

const emit = defineEmits<{
  detail: [id: string];
  like: [id: string];
  comment: [id: string];
  share: [id: string];
  topic: [topic: string];
}>();

const avatarText = computed(() => props.post.author.slice(0, 1));
const previewVisible = ref(false);
const previewIndex = ref(0);

const mediaColumns = computed(() => {
  return props.post.media.length >= 3 ? 3 : props.post.media.length;
});
const previewAssets = computed<MediaPreviewAsset[]>(() =>
  props.post.media.map((item) => ({
    type: "image",
    label: item,
    description: `${props.post.location} · ${props.post.time}`,
  }))
);

const likeText = computed(() => formatCount(props.post.likes));
const commentText = computed(() => formatCount(props.post.comments));
const shareText = computed(() => formatCount(props.post.shares));

function handleDetail() {
  if (props.mode !== "detail") {
    emit("detail", props.post.id);
  }
}

function openMediaPreview(index: number) {
  previewIndex.value = index;
  previewVisible.value = true;
}

function closePreview() {
  previewVisible.value = false;
}
</script>

<style scoped lang="scss">
.post-card {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 28rpx;
}

.post-main {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.post-card--detail {
  padding: 0;
  border: 0;
  box-shadow: none;
  background: transparent;
}

.post-head {
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.author-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff8d5f, #ff6b4a);
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
}

.author-meta {
  min-width: 0;
  flex: 1;
}

.author-line {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.author-name {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.author-tag {
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(255, 107, 74, 0.12);
  color: var(--brand-primary);
  font-size: 20rpx;
}

.post-meta {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: var(--text-tertiary);
}

.post-body {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.post-content {
  font-size: 28rpx;
  line-height: 1.8;
  color: var(--text-primary);
}

.topic-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.topic-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44rpx;
  padding: 0 4rpx;
  color: #5d7aa6;
  font-size: 22rpx;
}

.media-grid {
  display: grid;
  gap: 12rpx;
}

.media-grid--1 {
  grid-template-columns: 1fr;
}

.media-grid--2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.media-grid--3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.media-cell {
  display: flex;
  align-items: flex-end;
  min-height: 184rpx;
  padding: 20rpx;
  border-radius: 24rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(34, 26, 21, 0.16)),
    linear-gradient(135deg, #ffcfbf, #ffdca8 45%, #fff4ec);
}

.media-label {
  color: #6e5448;
  font-size: 22rpx;
  font-weight: 600;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding-top: 6rpx;
  border-top: 1rpx solid rgba(235, 226, 218, 0.9);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  height: 72rpx;
  flex: 1;
  min-width: 0;
  padding: 0;
  border: 0;
  outline: none;
  box-shadow: none;
  appearance: none;
  background: transparent;
  border-radius: 0;
}

.action-text {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.post-extra {
  display: contents;
}
</style>
