<template>
  <view class="page-shell my-comments-page">
    <z-paging
      ref="pagingRef"
      v-model="pagingItems"
      class="my-comments-page__paging"
      :fixed="false"
      :default-page-size="2"
      @query="queryList"
    >
      <view v-if="commentItems.length" class="my-comments-list">
        <button v-for="item in pagingItems" :key="item.id" class="comment-row card-shell" @tap="goDetail(item.postId)">
          <view class="comment-row__head">
            <text class="comment-row__title">{{ item.postTitle }}</text>
            <text class="comment-row__time">{{ item.time }}</text>
          </view>
          <text class="comment-row__content">{{ item.content }}</text>
        </button>
      </view>
      <content-empty
        v-else
        title="还没有评论记录"
        description="去评论一条动态吧，后续互动都会沉淀到这里。"
        icon="chat"
      />
    </z-paging>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { fetchMyComments } from "@/api/user";
import ContentEmpty from "@/components/content-empty.vue";
import { useFeed } from "@/hooks/use-feed";
import { usePagingList } from "@/hooks/use-paging-list";
import type { ApiComment } from "@/types/api";

const { posts } = useFeed();

const commentItems = computed(() =>
  posts.value.flatMap((post) =>
    post.commentList.slice(0, 2).map((comment) => ({
      id: comment.id,
      postId: post.id,
      postTitle: post.content.slice(0, 22),
      time: comment.time,
      content: `${comment.replyTo ? `回复 @${comment.replyTo} ` : ""}${comment.content}`,
    }))
  )
);

function normalizeComments(result: { items?: ApiComment[] } | ApiComment[]) {
  if (Array.isArray(result)) {
    return result;
  }
  return Array.isArray(result.items) ? result.items : [];
}

const { pagingRef, pagingList: pagingItems, queryList } = usePagingList(async (pageNo, pageSize) => {
  const offset = Math.max(pageNo - 1, 0) * pageSize;
  try {
    const result = await fetchMyComments({ limit: pageSize, offset });
    const items = normalizeComments(result).map((comment) => ({
      id: comment.commentId,
      postId: comment.postId,
      postTitle: "我的评论",
      time: comment.createdAt || "刚刚",
      content: comment.content,
    }));
    return {
      items,
      total: items.length,
    };
  } catch {
    const start = offset;
    return {
      items: commentItems.value.slice(start, start + pageSize),
      total: commentItems.value.length,
    };
  }
});

function goDetail(id: string) {
  uni.navigateTo({
    url: `/pages/post-detail/index?id=${id}&focus=comment`,
  });
}
</script>

<style scoped lang="scss">
.my-comments-page__paging {
  height: calc(100vh - 64rpx);
}

.my-comments-page__paging :deep(.zp-paging-container-content) {
  padding-top: 24rpx;
}

.my-comments-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.comment-row {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  padding: 28rpx 24rpx;
  text-align: left;
}

.comment-row__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.comment-row__title {
  min-width: 0;
  flex: 1;
  font-size: 26rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.comment-row__time {
  font-size: 22rpx;
  color: var(--text-tertiary);
}

.comment-row__content {
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--text-secondary);
}
</style>
