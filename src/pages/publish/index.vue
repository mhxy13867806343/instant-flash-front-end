<template>
  <view class="page-shell safe-bottom publish-page">
    <view class="card-shell publish-panel">
      <view class="publish-hero">
        <view>
          <text class="section-title">发布动态</text>
          <text class="section-desc">把此刻的灵感、地点和氛围分享出去，首页会实时看到你的新内容。</text>
        </view>
        <view class="publish-hero__badge">
          <u-icon name="camera" color="#FF6B4A" size="28" />
        </view>
      </view>

      <view class="card-shell publish-card">
        <view class="publish-card__head">
          <text class="publish-card__title">动态正文</text>
          <text class="publish-card__count">{{ content.length }}/300</text>
        </view>
        <textarea
          v-model="content"
          class="publish-textarea"
          maxlength="300"
          auto-height
          placeholder="分享这一刻在发生什么，比如地点、心情、想约的人..."
          placeholder-class="publish-placeholder"
        />
      </view>

      <view class="card-shell publish-card">
        <view class="publish-card__head">
          <text class="publish-card__title">选择话题</text>
          <text class="publish-card__hint">至少选一个，方便首页推荐</text>
        </view>
        <view class="topic-picker__tags">
          <button
            v-for="item in topics"
            :key="item"
            class="topic-picker__tag"
            :class="{ 'topic-picker__tag--active': selectedTopics.includes(item) }"
            @tap="toggleTopic(item)"
          >
            #{{ item }}
          </button>
        </view>
      </view>

      <view class="card-shell publish-card">
        <view class="publish-card__head">
          <text class="publish-card__title">媒体区域</text>
          <text class="publish-card__hint">{{ mediaHint }}</text>
        </view>
        <view class="upload-grid">
          <button
            v-for="item in mediaSlots"
            :key="item.id"
            class="upload-cell"
            :class="{
              'upload-cell--video': item.type === 'video',
              'upload-cell--add': item.type === 'add',
            }"
            @tap="handleMediaCellTap(item)"
          >
            <template v-if="item.type !== 'add'">
              <view class="upload-cell__preview" :class="{ 'upload-cell__preview--video': item.type === 'video' }">
                {{ item.label }}
              </view>
              <text class="upload-cell__action">{{ item.type === "video" ? "替换视频" : "重新选择" }}</text>
            </template>
            <template v-else>
              <u-icon name="plus" color="#FF6B4A" size="30" />
              <text class="upload-cell__action">添加图片 / 视频</text>
              <text class="upload-cell__meta">{{ addSlotMeta }}</text>
            </template>
          </button>
        </view>
      </view>

      <view class="card-shell publish-card">
        <view class="publish-card__head">
          <text class="publish-card__title">补充信息</text>
          <text class="publish-card__hint">让内容更像真实动态</text>
        </view>
        <view class="publish-meta">
          <view class="publish-meta__item">
            <text class="publish-meta__label">发布位置</text>
            <text class="publish-meta__value">杭州·滨江天街</text>
          </view>
          <view class="publish-meta__item">
            <text class="publish-meta__label">可见范围</text>
            <text class="publish-meta__value">公开</text>
          </view>
        </view>
      </view>
    </view>

    <view class="publish-actionbar">
      <button class="btn-ghost publish-actionbar__draft" @tap="saveDraft">存草稿</button>
      <button class="btn-primary publish-actionbar__submit" @tap="submit">发布动态</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

type MediaItem = {
  id: number;
  type: "image" | "video";
  label: string;
};

type MediaSlot =
  | MediaItem
  | {
      id: string;
      type: "add";
    };

const content = ref("");
const topics = ["同城发现", "灵感记录", "今日穿搭", "周末去哪"];
const selectedTopics = ref<string[]>(["同城发现"]);
const mediaItems = ref<MediaItem[]>([]);
const nextMediaId = ref(1);

const hasVideo = computed(() => mediaItems.value.some((item) => item.type === "video"));
const imageCount = computed(() => mediaItems.value.filter((item) => item.type === "image").length);
const mediaHint = computed(() => `支持最多 9 个媒体，可带 1 个视频，默认展示 1 个上传位`);
const addSlotMeta = computed(() =>
  hasVideo.value ? `已选 ${imageCount.value} 张图片 / 1 个视频` : `已选 ${imageCount.value} 张图片`
);

const mediaSlots = computed<MediaSlot[]>(() => {
  const slots: MediaSlot[] = [...mediaItems.value];

  if (mediaItems.value.length < 9) {
    slots.push({
      id: "add-slot",
      type: "add",
    });
  }

  return slots;
});

function toggleTopic(topic: string) {
  if (selectedTopics.value.includes(topic)) {
    if (selectedTopics.value.length === 1) {
      uni.showToast({
        title: "至少保留一个话题",
        icon: "none",
      });
      return;
    }

    selectedTopics.value = selectedTopics.value.filter((item) => item !== topic);
    return;
  }

  selectedTopics.value = [...selectedTopics.value, topic];
}

function addMedia(type: "image" | "video") {
  if (mediaItems.value.length >= 9) {
    uni.showToast({
      title: "最多添加 9 个媒体",
      icon: "none",
    });
    return;
  }

  if (type === "video" && hasVideo.value) {
    uni.showToast({
      title: "最多只能添加 1 个视频",
      icon: "none",
    });
    return;
  }

  const id = nextMediaId.value++;
  mediaItems.value = [
    ...mediaItems.value,
    {
      id,
      type,
      label: type === "video" ? `视频 ${id}` : `图片 ${id}`,
    },
  ];
  uni.showToast({
    title: type === "video" ? "已添加视频" : "已添加图片",
    icon: "none",
  });
}

function handleMediaCellTap(item: MediaSlot) {
  if (item.type === "add") {
    const itemList = hasVideo.value ? ["添加图片"] : ["添加图片", "添加视频"];
    uni.showActionSheet({
      itemList,
      success: ({ tapIndex }) => {
        if (itemList[tapIndex] === "添加视频") {
          addMedia("video");
          return;
        }

        addMedia("image");
      },
    });
    return;
  }

  uni.showActionSheet({
    itemList: item.type === "video" ? ["替换视频", "移除视频"] : ["重新选择", "移除图片"],
    success: ({ tapIndex }) => {
      if (tapIndex === 1) {
        mediaItems.value = mediaItems.value.filter((media) => media.id !== item.id);
        uni.showToast({
          title: item.type === "video" ? "已移除视频" : "已移除图片",
          icon: "none",
        });
        return;
      }

      mediaItems.value = mediaItems.value.map((media) =>
        media.id === item.id ? { ...media, label: media.type === "video" ? `视频 ${media.id}` : `图片 ${media.id}` } : media
      );
      uni.showToast({
        title: item.type === "video" ? "已更新视频" : "已更新图片",
        icon: "none",
      });
    },
  });
}

function saveDraft() {
  uni.showToast({
    title: "草稿已保存",
    icon: "none",
  });
}

function submit() {
  if (!content.value.trim()) {
    uni.showToast({
      title: "先写点动态内容",
      icon: "none",
    });
    return;
  }

  uni.showToast({
    title: "演示版发布成功",
    icon: "success",
  });
}
</script>

<style scoped lang="scss">
.publish-page {
  padding-top: 32rpx;
  padding-bottom: calc(env(safe-area-inset-bottom) + 196rpx);
}

.publish-panel {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 32rpx 28rpx;
}

.publish-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
}

.publish-hero__badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border-radius: 24rpx;
  background: rgba(255, 107, 74, 0.12);
}

.publish-card {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 24rpx;
}

.publish-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.publish-card__title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.publish-card__hint,
.publish-card__count {
  font-size: 22rpx;
  color: var(--text-tertiary);
}

.publish-textarea {
  width: 100%;
  min-height: 280rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #fff7f3;
  font-size: 28rpx;
  line-height: 1.8;
}

.publish-placeholder {
  color: #9b948e;
}

.topic-picker__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.topic-picker__tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 60rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: #fff4ef;
  color: var(--text-secondary);
  font-size: 24rpx;
}

.topic-picker__tag--active {
  background: rgba(255, 107, 74, 0.12);
  color: var(--brand-primary);
  font-weight: 700;
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14rpx;
}

.upload-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  min-height: 172rpx;
  padding: 18rpx;
  border: 2rpx dashed rgba(255, 107, 74, 0.24);
  border-radius: 24rpx;
  background: rgba(255, 244, 239, 0.75);
  color: var(--text-secondary);
}

.upload-cell--add {
  justify-content: center;
}

.upload-cell--video {
  grid-column: span 2;
  min-height: 188rpx;
}

.upload-cell__preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 88rpx;
  border-radius: 18rpx;
  background: linear-gradient(135deg, #ffcfbf, #ffe7d8);
  font-size: 24rpx;
  font-weight: 700;
  color: #8a5543;
}

.upload-cell__preview--video {
  min-height: 128rpx;
  background: linear-gradient(135deg, #ffd8c8, #ffe8d8 48%, #fff4ec);
}

.upload-cell__action {
  font-size: 22rpx;
}

.upload-cell__meta {
  font-size: 20rpx;
  color: var(--text-tertiary);
}

.publish-meta {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.publish-meta__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  padding: 18rpx 20rpx;
  border-radius: 20rpx;
  background: #fff7f3;
}

.publish-meta__label {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.publish-meta__value {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.publish-actionbar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  gap: 18rpx;
  padding: 20rpx 28rpx calc(env(safe-area-inset-bottom) + 24rpx);
  background: rgba(246, 242, 238, 0.96);
  backdrop-filter: blur(18px);
}

.publish-actionbar__draft {
  flex: 1;
}

.publish-actionbar__submit {
  flex: 1.4;
}
</style>
