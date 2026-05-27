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
          <text class="publish-card__count">{{ content.length }}/2000</text>
        </view>
        <textarea
          v-model="content"
          class="publish-textarea"
          maxlength="2000"
          auto-height
          placeholder="分享这一刻在发生什么，长文内容也可以慢慢写..."
          placeholder-class="publish-placeholder"
        />
      </view>

      <view class="card-shell publish-card">
        <view class="publish-card__head">
          <text class="publish-card__title">选择话题</text>
          <text class="publish-card__hint">至少选一个，方便首页推荐</text>
        </view>
        <button class="topic-search-entry" @tap="openTopicSearchPage">
          <u-icon name="search" color="#8D867F" size="30" />
          <text class="topic-search-entry__text">点击搜索话题</text>
        </button>
        <view class="topic-picker__summary">
          <text class="topic-picker__summary-title">推荐话题</text>
          <text class="topic-picker__summary-desc">点一下加入，已选中的话题再次点击可取消。</text>
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
import { recommendedTopicOptions } from "@/api/topic";

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

type PickedMediaFile = {
  fileType: "image" | "video";
  name?: string;
  file?: File;
};

const content = ref("");
const topics = recommendedTopicOptions;
const selectedTopics = ref<string[]>(["同城发现"]);
const mediaItems = ref<MediaItem[]>([]);
const nextMediaId = ref(1);

const videoCount = computed(() => mediaItems.value.filter((item) => item.type === "video").length);
const imageCount = computed(() => mediaItems.value.filter((item) => item.type === "image").length);
const mediaHint = computed(() => `支持图片和视频任意混传，总数最多 9 个，默认展示 1 个上传位`);
const addSlotMeta = computed(() =>
  `已选 ${imageCount.value} 张图片 / ${videoCount.value} 个视频`
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

function getMediaLabel(file: Record<string, any>, type: MediaItem["type"], id: number) {
  if (typeof file.file?.name === "string" && file.file.name) {
    return file.file.name;
  }

  if (typeof file.name === "string" && file.name) {
    return file.name;
  }

  return type === "video" ? `视频 ${id}` : `图片 ${id}`;
}

function isH5() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function openH5FilePicker(options: { accept: string; multiple: boolean }) {
  return new Promise<PickedMediaFile[]>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = options.accept;
    input.multiple = options.multiple;
    input.style.display = "none";

    input.onchange = () => {
      const files = Array.from(input.files || []).map((file) => ({
        fileType: file.type.startsWith("video/") ? ("video" as const) : ("image" as const),
        name: file.name,
        file,
      }));

      input.remove();
      resolve(files);
    };

    document.body.appendChild(input);
    input.click();
  });
}

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

function openTopicSearchPage() {
  uni.navigateTo({
    url: `/pages/topic-search/index?select=1&selected=${encodeURIComponent(selectedTopics.value.join(","))}`,
    success: (res) => {
      res.eventChannel.once("topic-selected", ({ topic }: { topic: string }) => {
        toggleTopic(topic);
      });
    },
  });
}

function appendMediaFromFiles(files: Record<string, any>[]) {
  if (!files.length) {
    return;
  }

  const nextItems = [...mediaItems.value];
  let addedCount = 0;

  for (const file of files) {
    if (nextItems.length >= 9) {
      break;
    }

    const type = file.fileType === "video" ? "video" : "image";
    const id = nextMediaId.value++;
    nextItems.push({
      id,
      type,
      label: getMediaLabel(file, type, id),
    });
    addedCount += 1;
  }

  mediaItems.value = nextItems;

  uni.showToast({
    title: addedCount ? `已添加 ${addedCount} 个媒体` : "最多添加 9 个媒体",
    icon: "none",
  });
}

function openAppMixedMediaPicker() {
  if (mediaItems.value.length >= 9) {
    uni.showToast({
      title: "最多添加 9 个媒体",
      icon: "none",
    });
    return;
  }

  uni.chooseMedia({
    count: 9 - mediaItems.value.length,
    mediaType: ["mix"],
    sourceType: ["album"],
    success: (result) => {
      appendMediaFromFiles((result.tempFiles || []) as Record<string, any>[]);
    },
  });
}

async function openMixedMediaPicker() {
  if (isH5()) {
    const files = await openH5FilePicker({
      accept: "image/*,video/*",
      multiple: true,
    });
    appendMediaFromFiles(files);
    return;
  }

  openAppMixedMediaPicker();
}

function updateMediaLabel(item: MediaItem, file: Record<string, any>) {
  mediaItems.value = mediaItems.value.map((media) =>
    media.id === item.id
      ? {
          ...media,
          label: getMediaLabel(file, item.type, media.id),
        }
      : media
  );

  uni.showToast({
    title: item.type === "video" ? "已更新视频" : "已更新图片",
    icon: "none",
  });
}

async function replaceMedia(item: MediaItem) {
  if (isH5()) {
    const files = await openH5FilePicker({
      accept: item.type === "video" ? "video/*" : "image/*",
      multiple: false,
    });
    const [file] = files;
    if (!file) {
      return;
    }

    updateMediaLabel(item, file);
    return;
  }

  uni.chooseMedia({
    count: 1,
    mediaType: [item.type],
    sourceType: ["album"],
    success: (result) => {
      const [file] = (result.tempFiles || []) as Record<string, any>[];
      if (!file) {
        return;
      }

      updateMediaLabel(item, file);
    },
  });
}

async function handleMediaCellTap(item: MediaSlot) {
  if (item.type === "add") {
    await openMixedMediaPicker();
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

      replaceMedia(item);
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

.topic-picker__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.topic-picker__summary-title {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.topic-picker__summary-desc,
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

.topic-search-entry {
  display: flex;
  align-items: center;
  gap: 16rpx;
  width: 100%;
  height: 84rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: #fff7f3;
  color: var(--text-secondary);
}

.topic-search-entry__text {
  font-size: 24rpx;
  color: #8d867f;
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
