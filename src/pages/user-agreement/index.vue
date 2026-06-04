<template>
  <view class="page">
    <view class="card">
      <text class="title">{{ agreement?.title || "用户协议" }}</text>
      <text v-if="agreement?.updatedAt" class="update-time">更新时间：{{ agreement.updatedAt }}</text>

      <view v-if="loading" class="state">内容加载中...</view>
      <view v-else-if="errorMsg" class="state">{{ errorMsg }}</view>
      <rich-text v-else class="content" :nodes="agreement?.content || ''" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { fetchAgreement, type Agreement } from "@/api/agreement";

const agreement = ref<Agreement | null>(null);
const loading = ref(true);
const errorMsg = ref("");

onLoad(() => {
  loadAgreement();
});

async function loadAgreement() {
  loading.value = true;
  errorMsg.value = "";
  try {
    agreement.value = await fetchAgreement("user");
  } catch (error) {
    errorMsg.value = error instanceof Error ? error.message : "内容加载失败";
  } finally {
    loading.value = false;
  }
}
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

.update-time {
  font-size: 22rpx;
  color: #9b948e;
}

.state {
  padding: 40rpx 0;
  font-size: 26rpx;
  color: #7a6d66;
  text-align: center;
}

.content {
  margin-top: 8rpx;
  font-size: 28rpx;
  line-height: 1.8;
  color: #4a403b;
}
</style>
