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
      <view v-if="historyPosts.length" class="history-list">
        <post-card
          v-for="post in pagingPosts"
          :key="post.id"
          :post="post"
          :show-actions="false"
          @detail="goDetail"
          @topic="handleTopicClick"
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
import { useTopicSearch } from "@/hooks/use-topic-search";

const { historyPosts } = useFeed();
const { pagingRef, pagingList: pagingPosts, queryList } = usePagingList(historyPosts);
const { openTopicSearch } = useTopicSearch();

function goDetail(id: string) {
  uni.navigateTo({
    url: `/pages/post-detail/index?id=${id}`,
  });
}

function handleTopicClick(topic: string) {
  openTopicSearch(topic);
}
</script>

<style scoped lang="scss">
.history-page__paging {
  height: calc(100vh - 64rpx);
}

.history-page__paging :deep(.zp-paging-container-content) {
  padding-top: 24rpx;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
</style>
