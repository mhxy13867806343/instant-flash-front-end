<template>
  <view class="page-shell safe-bottom profile-page">
    <view class="profile-card card-shell">
      <view class="profile-main">
        <view class="profile-avatar">即</view>
        <view class="profile-info">
          <text class="profile-name">即闪用户</text>
          <view class="profile-tags">
            <u-tag text="已登录" type="success" plain shape="circle" />
            <u-tag text="创作者" type="primary" plain shape="circle" />
          </view>
          <text class="profile-desc">记录生活灵感，分享此刻想表达的内容。</text>
        </view>
      </view>
      <u-button type="primary" shape="circle" text="编辑资料" />
    </view>

    <view class="stat-grid">
      <view v-for="item in stats" :key="item.label" class="stat-card card-shell">
        <text class="stat-value">{{ item.value }}</text>
        <text class="stat-label">{{ item.label }}</text>
      </view>
    </view>

    <view class="menu-panel card-shell">
      <view class="section-head">
        <text class="section-title">常用功能</text>
        <text class="section-desc">这里先用 uView 组件把个人页骨架搭起来。</text>
      </view>

      <u-cell-group>
        <u-cell-item
          v-for="item in menus"
          :key="item.title"
          :title="item.title"
          :label="item.desc"
          :value="item.value"
          is-link
        />
      </u-cell-group>
    </view>
  </view>
</template>

<script setup lang="ts">
const stats = [
  { label: "我的发布", value: "12" },
  { label: "收到点赞", value: "248" },
  { label: "互动消息", value: "36" },
];

const menus = [
  { title: "我的发布", desc: "查看已发布的内容", value: "12 条" },
  { title: "我的点赞", desc: "回看收藏和点赞记录", value: "84 次" },
  { title: "我的评论", desc: "管理所有评论互动", value: "19 条" },
  { title: "消息中心", desc: "查看系统消息和互动提醒", value: "3 条未读" },
  { title: "隐私协议", desc: "了解平台隐私与使用说明", value: "" },
];
</script>

<style scoped lang="scss">
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.profile-card {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
  padding: 32rpx 28rpx;
}

.profile-main {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.profile-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 108rpx;
  height: 108rpx;
  border-radius: 50%;
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
}

.profile-info {
  min-width: 0;
  flex: 1;
}

.profile-name {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.profile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 12rpx;
}

.profile-desc {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--text-secondary);
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  padding: 28rpx 16rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.menu-panel {
  overflow: hidden;
  padding: 28rpx 0 0;
}

.section-head {
  padding: 0 28rpx 20rpx;
}
</style>
