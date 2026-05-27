<template>
  <view class="page-shell my-likes-page">
    <view class="card-shell my-likes-panel">
      <text class="section-title">我的点赞</text>
      <text class="section-desc">这里会展示你点赞过的内容，首页或详情取消点赞后这里也会同步变化。</text>
    </view>

    <view class="my-likes-list">
      <post-card
        v-for="post in likedPosts"
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
const likedPosts = computed(() => posts.value.filter((item) => item.liked));

function goDetail(id: string) {
  uni.navigateTo({
    url: `/pages/post-detail/index?id=${id}`,
  });
}
</script>

<style scoped lang="scss">
.my-likes-page {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.my-likes-panel {
  padding: 32rpx 28rpx;
}

.my-likes-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
</style>
