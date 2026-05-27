<template>
  <view class="page-shell my-comments-page">
    <view class="card-shell my-comments-panel">
      <text class="section-title">我的评论</text>
      <text class="section-desc">这里汇总你参与过的评论互动，点击对应动态可继续回复。</text>
    </view>

    <view class="my-comments-list">
      <button v-for="item in commentItems" :key="item.id" class="comment-row card-shell" @tap="goDetail(item.postId)">
        <view class="comment-row__head">
          <text class="comment-row__title">{{ item.postTitle }}</text>
          <text class="comment-row__time">{{ item.time }}</text>
        </view>
        <text class="comment-row__content">{{ item.content }}</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useFeed } from "@/hooks/use-feed";

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

function goDetail(id: string) {
  uni.navigateTo({
    url: `/pages/post-detail/index?id=${id}&focus=comment`,
  });
}
</script>

<style scoped lang="scss">
.my-comments-page {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.my-comments-panel {
  padding: 32rpx 28rpx;
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
