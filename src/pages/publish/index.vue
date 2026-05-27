<template>
  <view class="page-shell publish-page">
    <view class="card-shell publish-panel">
      <view>
        <text class="section-title">发布动态</text>
        <text class="section-desc">先完成演示版表单，后面再接图片上传和真实发布接口。</text>
      </view>

      <textarea
        v-model="content"
        class="publish-textarea"
        maxlength="300"
        placeholder="分享这一刻在发生什么..."
        placeholder-class="publish-placeholder"
      />

      <view class="topic-picker">
        <text class="topic-picker__label">添加话题</text>
        <view class="topic-picker__tags">
          <button
            v-for="item in topics"
            :key="item"
            class="topic-picker__tag"
            :class="{ 'topic-picker__tag--active': selectedTopic === item }"
            @tap="selectedTopic = item"
          >
            #{{ item }}
          </button>
        </view>
      </view>

      <view class="upload-grid">
        <view v-for="item in 3" :key="item" class="upload-cell">
          <u-icon name="plus" color="#FF6B4A" size="30" />
          <text>添加图片</text>
        </view>
      </view>

      <u-button type="primary" shape="circle" text="发布动态" @click="submit" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";

const content = ref("");
const selectedTopic = ref("同城发现");
const topics = ["同城发现", "灵感记录", "今日穿搭", "周末去哪"];

function submit() {
  uni.showToast({
    title: "演示版发布成功",
    icon: "success",
  });
}
</script>

<style scoped lang="scss">
.publish-page {
  padding-top: 32rpx;
}

.publish-panel {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
  padding: 32rpx 28rpx;
}

.publish-textarea {
  width: 100%;
  min-height: 280rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #fff7f3;
  font-size: 28rpx;
  line-height: 1.8;
}

.publish-placeholder {
  color: #9b948e;
}

.topic-picker {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.topic-picker__label {
  font-size: 26rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.topic-picker__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.topic-picker__tag {
  height: 60rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: #fff4ef;
  color: var(--text-secondary);
  font-size: 24rpx;
}

.topic-picker__tag--active {
  background: rgba(255, 107, 74, 0.12);
  color: var(--brand-primary);
  font-weight: 700;
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14rpx;
}

.upload-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  min-height: 172rpx;
  border: 2rpx dashed rgba(255, 107, 74, 0.24);
  border-radius: 24rpx;
  background: rgba(255, 244, 239, 0.75);
  font-size: 22rpx;
  color: var(--text-secondary);
}
</style>
