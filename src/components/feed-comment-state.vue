<template>
  <view class="comment-state">
    <view class="comment-state__summary">
      <view class="comment-state__summary-copy">
        <text class="comment-state__title">评论 {{ count }} 条</text>
        <text class="comment-state__desc">
          {{ count > 0 ? "可以继续回复、发表新评论，互动会实时同步。" : "还没有评论，来抢个沙发，发出第一条互动吧。" }}
        </text>
      </view>
      <view class="comment-state__badge">
        <u-icon name="chat" color="#FF6B4A" size="24" />
      </view>
    </view>

    <content-empty
      v-if="count === 0"
      title="暂时还没有评论"
      description="输入框仍然可以直接发送评论，发布后这里会马上显示。"
      icon="chat"
    />
  </view>
</template>

<script setup lang="ts">
import ContentEmpty from "@/components/content-empty.vue";

defineProps<{
  count: number;
}>();
</script>

<style scoped lang="scss">
.comment-state {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.comment-state__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 20rpx 22rpx;
  border-radius: 22rpx;
  background: #fff7f3;
}

.comment-state__summary-copy {
  min-width: 0;
  flex: 1;
}

.comment-state__title {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.comment-state__desc {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: var(--text-secondary);
}

.comment-state__badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: rgba(255, 107, 74, 0.12);
}

</style>
