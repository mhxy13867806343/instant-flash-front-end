<template>
  <view class="page">
    <view class="card">
      <text class="title">用户协议</text>
      <text class="desc">用户协议页开发中</text>
    </view>
  </view>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  padding: 48rpx 32rpx;
  background: #f6f2ee;
  box-sizing: border-box;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 40rpx 32rpx;
  border-radius: 24rpx;
  background: #fffdfb;
  box-shadow: 0 12rpx 40rpx rgba(34, 24, 20, 0.06);
}

.title {
  font-size: 40rpx;
  font-weight: 600;
  color: #2f2622;
}

.desc {
  font-size: 28rpx;
  line-height: 1.6;
  color: #7a6d66;
}
</style>
