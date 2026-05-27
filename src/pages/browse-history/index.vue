<template>
  <view class="page-shell history-page">
    <z-paging
      ref="pagingRef"
      v-model="pagingPosts"
      class="history-page__paging"
      :fixed="false"
      :default-page-size="2"
      @query="queryList"
    >
      <template #top>
        <view class="card-shell history-panel">
          <text class="section-title">最近浏览</text>
          <text class="section-desc">这里会记录最近看过的动态，和首页/详情共用同一份内容数据，当前列表已接入 z-paging。</text>
        </view>
      </template>

      <view v-if="historyPosts.length" class="history-list">
        <post-card
          v-for="post in pagingPosts"
          :key="post.id"
          :post="post"
          :show-actions="false"
          @detail="goDetail"
        />
      </view>
      <content-empty
        v-else
        title="还没有浏览记录"
        description="先去首页看看内容，这里会自动记录你最近浏览过的动态。"
        icon="clock"
      />
    </z-paging>
  </view>
</template>

<script setup lang="ts">
import ContentEmpty from "@/components/content-empty.vue";
import { useFeed } from "@/hooks/use-feed";
import { usePagingList } from "@/hooks/use-paging-list";
import PostCard from "@/components/post-card.vue";

const { historyPosts } = useFeed();
const { pagingRef, pagingList: pagingPosts, queryList } = usePagingList(historyPosts);

function goDetail(id: string) {
  uni.navigateTo({
    url: `/pages/post-detail/index?id=${id}`,
  });
}
</script>

<style scoped lang="scss">
.history-page__paging {
  height: calc(100vh - 64rpx);
}

.history-panel {
  padding: 32rpx 28rpx;
  margin-bottom: 24rpx;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
</style>
