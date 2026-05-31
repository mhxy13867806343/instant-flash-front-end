<template>
  <view class="page-shell my-posts-page">
    <z-paging
      ref="pagingRef"
      v-model="pagingPosts"
      class="my-posts-page__paging"
      :fixed="false"
      :default-page-size="1"
      @query="queryList"
    >
      <view v-if="myPosts.length" class="my-posts-list">
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
        title="还没有发布内容"
        description="发一条新的动态后，这里会展示你的全部发布记录。"
        icon="edit-pen"
      />
    </z-paging>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { fetchMyPosts } from "@/api/user";
import ContentEmpty from "@/components/content-empty.vue";
import PostCard from "@/components/post-card.vue";
import { useFeed } from "@/hooks/use-feed";
import { usePagingList } from "@/hooks/use-paging-list";
import { useTopicSearch } from "@/hooks/use-topic-search";
import { mapApiPostToFeedPost } from "@/utils/post-mapper";

const { posts } = useFeed();
const myPosts = computed(() => posts.value.slice(0, 2));
const { pagingRef, pagingList: pagingPosts, queryList } = usePagingList(async (pageNo, pageSize) => {
  const offset = Math.max(pageNo - 1, 0) * pageSize;
  try {
    const result = await fetchMyPosts({ limit: pageSize, offset });
    return {
      items: result.items.map(mapApiPostToFeedPost),
      total: result.total,
    };
  } catch {
    const start = offset;
    return {
      items: myPosts.value.slice(start, start + pageSize),
      total: myPosts.value.length,
    };
  }
});
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
.my-posts-page__paging {
  height: calc(100vh - 64rpx);
}

.my-posts-page__paging :deep(.zp-paging-container-content) {
  padding-top: 24rpx;
}

.my-posts-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
</style>
