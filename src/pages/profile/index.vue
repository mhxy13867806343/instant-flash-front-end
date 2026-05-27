<template>
  <view class="page-shell page-with-tabbar profile-page">
    <view class="profile-card card-shell">
      <view class="profile-card__main">
        <button class="profile-card__avatar" @tap="editAvatar">
          <text class="profile-card__avatar-text">即</text>
        </button>
        <view class="profile-card__info">
          <text class="profile-card__name">即闪用户</text>
          <view class="profile-card__tags">
            <text class="profile-card__tag profile-card__tag--success">已登录</text>
            <text class="profile-card__tag profile-card__tag--primary">创作者</text>
            <text class="profile-card__tag profile-card__tag--warning">已绑定手机号</text>
          </view>
          <text class="profile-card__desc">记录生活灵感，分享此刻想表达的内容，也收集身边值得被看见的动态。</text>
        </view>
      </view>
      <view class="profile-card__actions">
        <button class="profile-card__action profile-card__action--primary" @tap="go('/pages/edit-profile/index')">编辑资料</button>
        <button class="profile-card__action profile-card__action--secondary" @tap="go('/pages/bind-phone/index')">绑定手机</button>
      </view>
    </view>

    <view class="stat-grid">
      <button
        v-for="item in stats"
        :key="item.label"
        class="stat-card card-shell"
        @tap="go(item.path)"
      >
        <text class="stat-card__value">{{ item.value }}</text>
        <text class="stat-card__label">{{ item.label }}</text>
      </button>
    </view>

    <view class="menu-panel card-shell">
      <view class="section-head">
        <text class="section-title">内容管理</text>
        <text class="section-desc">这些入口现在都可以点进去，后面再逐步替换真实数据。</text>
      </view>

      <u-cell-group>
        <u-cell-item
          v-for="item in menus"
          :key="item.title"
          :title="item.title"
          :label="item.desc"
          :value="item.value"
          is-link
          @click="go(item.path)"
        />
      </u-cell-group>
    </view>

    <instant-tabbar current="profile" />
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import InstantTabbar from "@/components/instant-tabbar.vue";
import { useFeed } from "@/hooks/use-feed";
import { formatCount } from "@/utils/number";

const { posts, historyPosts } = useFeed();

const stats = computed(() => [
  { label: "我的发布", value: formatCount(12), path: "/pages/my-posts/index" },
  { label: "收到点赞", value: formatCount(posts.value.reduce((sum, item) => sum + item.likes, 0)), path: "/pages/my-likes/index" },
  { label: "浏览记录", value: formatCount(historyPosts.value.length), path: "/pages/browse-history/index" },
  { label: "互动消息", value: formatCount(36), path: "/pages/messages/index" },
]);

const menus = computed(() => [
  { title: "浏览记录", desc: "查看最近浏览过的动态", value: `${historyPosts.value.length} 条`, path: "/pages/browse-history/index" },
  { title: "我的发布", desc: "查看已发布的内容", value: "12 条", path: "/pages/my-posts/index" },
  { title: "我的点赞", desc: "回看收藏和点赞记录", value: "84 次", path: "/pages/my-likes/index" },
  { title: "我的评论", desc: "管理所有评论互动", value: "19 条", path: "/pages/my-comments/index" },
  { title: "我的分享", desc: "查看转发和分享记录", value: "7 次", path: "/pages/my-shares/index" },
  { title: "消息中心", desc: "查看系统消息和互动提醒", value: "3 条未读", path: "/pages/messages/index" },
  { title: "隐私协议", desc: "了解平台隐私与使用说明", value: "", path: "/pages/privacy/index" },
  { title: "用户协议", desc: "查看平台使用规则", value: "", path: "/pages/user-agreement/index" },
]);

function go(url: string) {
  uni.navigateTo({ url });
}

function editAvatar() {
  uni.showActionSheet({
    itemList: ["拍照上传", "从相册选择", "去资料页编辑"],
    success: ({ tapIndex }) => {
      if (tapIndex === 2) {
        go("/pages/edit-profile/index?focus=avatar");
        return;
      }
      uni.showToast({
        title: tapIndex === 0 ? "已打开拍照入口" : "已打开相册入口",
        icon: "none",
      });
    },
  });
}
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

.profile-card__main {
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
}

.profile-card__avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 108rpx;
}

.profile-card__avatar-text {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 108rpx;
  height: 108rpx;
  border-radius: 50%;
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
}

.profile-card__info {
  min-width: 0;
  flex: 1;
}

.profile-card__name {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.profile-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 12rpx;
}

.profile-card__tag {
  display: inline-flex;
  align-items: center;
  height: 52rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 700;
}

.profile-card__tag--success {
  color: #2fa36a;
  background: rgba(47, 163, 106, 0.12);
}

.profile-card__tag--primary {
  color: #3d7cff;
  background: rgba(61, 124, 255, 0.12);
}

.profile-card__tag--warning {
  color: #ff9f2f;
  background: rgba(255, 159, 47, 0.12);
}

.profile-card__desc {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--text-secondary);
}

.profile-card__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.profile-card__action {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 84rpx;
  border-radius: 999rpx;
  font-size: 26rpx;
  font-weight: 700;
}

.profile-card__action--primary {
  color: #fff;
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
}

.profile-card__action--secondary {
  color: var(--brand-primary);
  background: #fff1ea;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  width: 100%;
  min-height: 172rpx;
  padding: 28rpx 16rpx;
}

.stat-card__value {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-card__label {
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
