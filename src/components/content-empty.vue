<template>
  <view class="content-empty card-shell">
    <view class="content-empty__icon">
      <u-icon :name="icon" color="#FF6B4A" size="34" />
    </view>
    <text class="content-empty__title">{{ title }}</text>
    <text class="content-empty__desc">{{ description }}</text>
  </view>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    description: string;
    icon?: string;
  }>(),
  {
    icon: "chat",
  }
);
</script>

<style scoped lang="scss">
.content-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14rpx;
  padding: 36rpx 28rpx;
  text-align: center;
}

.content-empty__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: rgba(255, 107, 74, 0.1);
}

.content-empty__title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.content-empty__desc {
  font-size: 22rpx;
  line-height: 1.7;
  color: var(--text-secondary);
}
</style>
