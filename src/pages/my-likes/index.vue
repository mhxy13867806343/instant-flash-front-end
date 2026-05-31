<template>
  <view class="page-shell my-likes-page">
    <z-paging
      ref="pagingRef"
      v-model="pagingPosts"
      class="my-likes-page__paging"
      :fixed="false"
      :default-page-size="1"
      @query="queryList"
    >
      <view v-if="likedPosts.length" class="my-likes-list">
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
        title="还没有点赞内容"
        description="去首页逛逛并点个赞，这里就会同步收录。"
        icon="heart"
      />
    </z-paging>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { fetchMyLikes } from "@/api/user";
import ContentEmpty from "@/components/content-empty.vue";
import PostCard from "@/components/post-card.vue";
import { useFeed } from "@/hooks/use-feed";
import { usePagingList } from "@/hooks/use-paging-list";
import { useTopicSearch } from "@/hooks/use-topic-search";
import { mapApiPostToFeedPost } from "@/utils/post-mapper";

const { posts } = useFeed();
const likedPosts = computed(() => posts.value.filter((item) => item.liked));
const { pagingRef, pagingList: pagingPosts, queryList } = usePagingList(async (pageNo, pageSize) => {
  const offset = Math.max(pageNo - 1, 0) * pageSize;
  try {
    const result = await fetchMyLikes({ limit: pageSize, offset });
    return {
      items: result.items.map(mapApiPostToFeedPost),
      total: result.total,
    };
  } catch {
    const start = offset;
    return {
      items: likedPosts.value.slice(start, start + pageSize),
      total: likedPosts.value.length,
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
.my-likes-page__paging {
  height: calc(100vh - 64rpx);
}

.my-likes-page__paging :deep(.zp-paging-container-content) {
  padding-top: 24rpx;
}

.my-likes-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
</style>
