<template>
  <view class="page-shell my-posts-page">
    <view class="card-shell my-posts-panel">
      <text class="section-title">我的发布</text>
      <text class="section-desc">这里展示当前账号发布过的动态，点击卡片可直接进入详情继续编辑内容。</text>
    </view>

    <view class="my-posts-list">
      <post-card
        v-for="post in myPosts"
        :key="post.id"
        :post="post"
        :show-actions="false"
        @detail="goDetail"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import PostCard from "@/components/post-card.vue";
import { useFeed } from "@/hooks/use-feed";

const { posts } = useFeed();
const myPosts = computed(() => posts.value.slice(0, 2));

function goDetail(id: string) {
  uni.navigateTo({
    url: `/pages/post-detail/index?id=${id}`,
  });
}
</script>

<style scoped lang="scss">
.my-posts-page {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.my-posts-panel {
  padding: 32rpx 28rpx;
}

.my-posts-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
</style>
