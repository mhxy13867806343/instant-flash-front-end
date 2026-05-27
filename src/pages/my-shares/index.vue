<template>
  <view class="page-shell my-shares-page">
    <z-paging
      ref="pagingRef"
      v-model="pagingPosts"
      class="my-shares-page__paging"
      :fixed="false"
      :default-page-size="2"
      @query="queryList"
    >
      <template #top>
        <view class="card-shell my-shares-panel">
          <text class="section-title">我的分享</text>
          <text class="section-desc">这里展示被你转发过和分享热度较高的动态，分享数和首页详情保持同步。</text>
        </view>
      </template>

      <view v-if="sharePosts.length" class="my-shares-list">
        <button v-for="post in pagingPosts" :key="post.id" class="share-row card-shell" @tap="goDetail(post.id)">
          <view class="share-row__head">
            <text class="share-row__author">{{ post.author }}</text>
            <text class="share-row__count">已分享 {{ post.shares }} 次</text>
          </view>
          <text class="share-row__content">{{ post.content }}</text>
        </button>
      </view>
      <content-empty
        v-else
        title="还没有分享记录"
        description="分享过的动态会出现在这里，方便你回看传播效果。"
        icon="share"
      />
    </z-paging>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ContentEmpty from "@/components/content-empty.vue";
import { useFeed } from "@/hooks/use-feed";
import { usePagingList } from "@/hooks/use-paging-list";

const { posts } = useFeed();
const sharePosts = computed(() => [...posts.value].sort((a, b) => b.shares - a.shares).slice(0, 3));
const { pagingRef, pagingList: pagingPosts, queryList } = usePagingList(sharePosts);

function goDetail(id: string) {
  uni.navigateTo({
    url: `/pages/post-detail/index?id=${id}&focus=share`,
  });
}
</script>

<style scoped lang="scss">
.my-shares-page {
  padding-top: 24rpx;
}

.my-shares-page__paging {
  height: calc(100vh - 64rpx);
}

.my-shares-panel {
  padding: 32rpx 28rpx;
  margin-bottom: 24rpx;
}

.my-shares-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.share-row {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  padding: 28rpx 24rpx;
  text-align: left;
}

.share-row__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.share-row__author {
  font-size: 26rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.share-row__count {
  font-size: 22rpx;
  color: var(--brand-primary);
}

.share-row__content {
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--text-secondary);
}
</style>
