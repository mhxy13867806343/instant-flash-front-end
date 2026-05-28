<template>
  <u-popup :show="show" mode="center" round="24" @close="emit('close')">
    <view v-if="items.length" class="media-preview-popup">
      <view class="media-preview-popup__head">
        <view class="media-preview-popup__spacer" />
        <text class="media-preview-popup__counter">{{ displayIndex }}/{{ items.length }}</text>
        <button class="media-preview-popup__close" @tap="emit('close')">x</button>
      </view>

      <swiper class="media-preview-popup__swiper" :current="current" @change="handleSwiperChange">
        <swiper-item v-for="(item, index) in items" :key="`${item.label}-${index}`">
          <view class="media-preview-popup__body">
            <image
              v-if="item.type === 'image' && item.src"
              class="media-preview-popup__image"
              :src="item.src"
              mode="aspectFit"
            />
            <video
              v-else-if="item.type === 'video' && item.src"
              class="media-preview-popup__video"
              :src="item.src"
              controls
              autoplay
              object-fit="contain"
            />
            <view v-else class="media-preview-popup__placeholder">
              <text class="media-preview-popup__placeholder-text">{{ item.label }}</text>
            </view>
          </view>
        </swiper-item>
      </swiper>

      <view class="media-preview-popup__meta">
        <text class="media-preview-popup__name">{{ activeItem?.label || "" }}</text>
        <text v-if="activeItem?.description" class="media-preview-popup__desc">{{ activeItem.description }}</text>
      </view>

      <view v-if="$slots.footer" class="media-preview-popup__footer">
        <slot name="footer" />
      </view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import { computed } from "vue";

export type MediaPreviewAsset = {
  type: "image" | "video";
  label: string;
  src?: string;
  description?: string;
};

const props = defineProps<{
  show: boolean;
  items: MediaPreviewAsset[];
  current: number;
}>();

const emit = defineEmits<{
  close: [];
  "update:current": [index: number];
}>();

const normalizedCurrent = computed(() => {
  if (!props.items.length) {
    return 0;
  }

  return Math.min(Math.max(props.current, 0), props.items.length - 1);
});

const displayIndex = computed(() => normalizedCurrent.value + 1);
const activeItem = computed(() => props.items[normalizedCurrent.value] || null);

function handleSwiperChange(event: { detail?: { current?: number } }) {
  emit("update:current", event.detail?.current || 0);
}
</script>

<style scoped lang="scss">
.media-preview-popup {
  width: 680rpx;
  max-width: calc(100vw - 40rpx);
  padding: 28rpx;
  background: #fff;
}

.media-preview-popup__head {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

.media-preview-popup__spacer {
  width: 1rpx;
  height: 1rpx;
}

.media-preview-popup__counter {
  justify-self: center;
  font-size: 30rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.media-preview-popup__close {
  justify-self: end;
  width: 56rpx;
  height: 56rpx;
  border-radius: 999rpx;
  background: rgba(35, 29, 26, 0.08);
  color: var(--text-primary);
  font-size: 28rpx;
  line-height: 56rpx;
  text-align: center;
  border: none;
}

.media-preview-popup__swiper {
  width: 100%;
  height: 760rpx;
  margin-top: 24rpx;
}

.media-preview-popup__body {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 24rpx;
  overflow: hidden;
  background: #f8f1ec;
}

.media-preview-popup__image,
.media-preview-popup__video {
  width: 100%;
  height: 100%;
}

.media-preview-popup__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 40rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(34, 26, 21, 0.16)),
    linear-gradient(135deg, #ffcfbf, #ffdca8 45%, #fff4ec);
}

.media-preview-popup__placeholder-text {
  font-size: 42rpx;
  font-weight: 700;
  color: #6e5448;
  text-align: center;
}

.media-preview-popup__meta {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-top: 20rpx;
}

.media-preview-popup__footer {
  margin-top: 24rpx;
}

.media-preview-popup__name {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.media-preview-popup__desc {
  font-size: 22rpx;
  color: var(--text-tertiary);
}
</style>
