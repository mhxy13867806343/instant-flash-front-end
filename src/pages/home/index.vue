<template>
  <view class="page-shell page-with-tabbar home-page">
    <z-paging
      ref="pagingRef"
      v-model="pagingPosts"
      class="home-page__paging"
      :fixed="false"
      :default-page-size="2"
      @query="queryList"
    >
      <template #top>
        <view class="home-page__sticky">
          <view class="hero card-shell">
            <view class="hero__top">
              <view class="hero__copy">
                <text class="hero__title">即闪</text>
                <text class="hero__subtitle">看附近动态，即时灵感，和同频的人互动。</text>
              </view>
              <button class="hero__publish" @tap="goPublish">
                <view class="hero__publish-icon">+</view>
                <text class="hero__publish-label">发动态</text>
              </button>
            </view>

            <u-search
              v-model="keyword"
              placeholder="搜索动态、用户、地点"
              :show-action="false"
              bg-color="#FFF7F3"
              placeholder-color="#9B948E"
            />

            <view class="feed-switch">
              <button
                v-for="item in tabs"
                :key="item"
                class="feed-switch__item"
                :class="{ 'feed-switch__item--active': activeTab === item }"
                @tap="activeTab = item"
              >
                {{ item }}
              </button>
            </view>
          </view>

          <view class="feed-summary">
            <view>
              <text class="section-title">最新动态</text>
              <text class="section-desc">首页列表已接入 z-paging，下拉刷新和上拉加载统一可用。</text>
            </view>
            <text class="feed-summary__count">{{ filteredPosts.length }} 条内容</text>
          </view>
        </view>
      </template>

      <view v-if="filteredPosts.length" class="feed-list">
        <post-card
          v-for="post in pagingPosts"
          :key="post.id"
          :post="post"
          @detail="goDetail"
          @like="handleLike"
          @comment="toggleComment"
          @share="handleShare"
          @topic="handleTopicClick"
        />
      </view>
      <content-empty
        v-else
        title="暂时没有匹配的动态"
        description="可以试试切换推荐/最新，或者换个关键词重新搜索。"
        icon="search"
      />
    </z-paging>

    <feed-comment-popup
      :show="Boolean(activeCommentPost)"
      :post="activeCommentPost"
      :draft="commentDraft"
      :reply-target="replyTarget"
      :show-emoji="emojiPanelId === activeCommentId"
      :emojis="emojis"
      @close="closeCommentPopup"
      @reply="replyToComment(activeCommentId, $event)"
      @clear-reply="clearReply"
      @update:draft="commentDraft = $event"
      @toggle-emoji="toggleEmoji(activeCommentId)"
      @append-emoji="appendEmoji($event)"
      @submit="submitComment(activeCommentId)"
    />

    <instant-tabbar current="home" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onHide, onUnload } from "@dcloudio/uni-app";
import ContentEmpty from "@/components/content-empty.vue";
import FeedCommentPopup from "@/components/feed-comment-popup.vue";
import InstantTabbar from "@/components/instant-tabbar.vue";
import PostCard from "@/components/post-card.vue";
import { useFeed } from "@/hooks/use-feed";
import { useHomeFeed } from "@/hooks/use-home-feed";
import { usePagingList } from "@/hooks/use-paging-list";
import { useTopicSearch } from "@/hooks/use-topic-search";

const activeCommentId = ref("");
const commentDraft = ref("");
const replyTarget = ref("");
const emojiPanelId = ref("");
const emojis = ["😀", "😍", "👏", "🔥", "👍", "🥹", "🎉", "😄", "🤝", "💯"];
const { posts, toggleLike, increaseShare, addComment } = useFeed();
const { keyword, tabs, activeTab, filteredPosts } = useHomeFeed(posts);
const { pagingRef, pagingList: pagingPosts, queryList } = usePagingList(filteredPosts);
const { openTopicSearch } = useTopicSearch();
const activeCommentPost = computed(() => posts.value.find((item) => item.id === activeCommentId.value) || null);

function goPublish() {
  uni.navigateTo({
    url: "/pages/publish/index",
  });
}

function goDetail(id: string) {
  uni.navigateTo({
    url: `/pages/post-detail/index?id=${id}`,
  });
}

function handleLike(id: string) {
  const result = toggleLike(id);
  uni.showToast({
    title: result.liked ? "已点赞" : "已取消点赞",
    icon: "none",
  });
}

function toggleComment(id: string) {
  if (activeCommentId.value === id) {
    closeCommentPopup();
    return;
  }

  activeCommentId.value = id;
  replyTarget.value = "";
  emojiPanelId.value = "";
}

function closeCommentPopup() {
  commentDraft.value = "";
  replyTarget.value = "";
  activeCommentId.value = "";
  emojiPanelId.value = "";
}

function submitComment(id: string) {
  const content = commentDraft.value.trim();
  if (!content) {
    uni.showToast({
      title: "先写点评论内容",
      icon: "none",
    });
    return;
  }

  addComment(id, {
    author: "当前用户",
    content,
    replyTo: replyTarget.value || undefined,
  });
  commentDraft.value = "";
  replyTarget.value = "";
  emojiPanelId.value = "";
  uni.showToast({
    title: "评论已发送",
    icon: "none",
  });
}

function handleShare(id: string) {
  uni.showActionSheet({
    itemList: ["转发给朋友", "复制链接", "生成海报"],
    success: () => {
      increaseShare(id);
      uni.showToast({
        title: "已分享",
        icon: "none",
      });
    },
  });
}

function handleTopicClick(topic: string) {
  openTopicSearch(topic);
}

function replyToComment(postId: string, author: string) {
  activeCommentId.value = postId;
  replyTarget.value = author;
}

function clearReply() {
  if (!replyTarget.value) {
    return;
  }

  if (!commentDraft.value.trim()) {
    replyTarget.value = "";
    return;
  }

  uni.showModal({
    title: "清空输入",
    content: "当前已输入评论内容，确认后会清空回复对象和输入内容。",
    confirmText: "清空",
    cancelText: "继续编辑",
    success: ({ confirm }) => {
      if (confirm) {
        commentDraft.value = "";
        replyTarget.value = "";
        emojiPanelId.value = "";
        uni.showToast({
          title: "已清空",
          icon: "none",
        });
      }
    },
  });
}

function toggleEmoji(postId: string) {
  emojiPanelId.value = emojiPanelId.value === postId ? "" : postId;
}

function appendEmoji(emoji: string) {
  commentDraft.value = `${commentDraft.value}${emoji}`;
}

function resetCommentDraft() {
  activeCommentId.value = "";
  commentDraft.value = "";
  replyTarget.value = "";
  emojiPanelId.value = "";
}

onHide(() => {
  resetCommentDraft();
});

onUnload(() => {
  resetCommentDraft();
});
</script>

<style scoped lang="scss">
.home-page {
  padding-top: 24rpx;
}

.home-page__paging {
  height: calc(100vh - 64rpx);
}

.home-page__sticky {
  position: sticky;
  top: 0;
  z-index: 20;
  margin: -24rpx 0 0;
  padding: 24rpx 0 16rpx;
  background: rgba(246, 242, 238, 0.94);
  backdrop-filter: blur(18px);
}

.hero {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 32rpx 28rpx;
}

.hero__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
}

.hero__copy {
  min-width: 0;
  flex: 1;
}

.hero__title {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.hero__subtitle {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  line-height: 1.6;
  color: var(--text-secondary);
}

.hero__publish {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  flex-shrink: 0;
  height: 72rpx;
  padding: 0 22rpx 0 14rpx;
  border-radius: 999rpx;
  background: rgba(255, 107, 74, 0.08);
}

.hero__publish-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
  color: #fff;
  font-size: 34rpx;
  line-height: 1;
}

.hero__publish-label {
  color: var(--brand-primary);
  font-size: 24rpx;
  font-weight: 700;
  white-space: nowrap;
}

.feed-switch {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 8rpx;
  border-radius: 999rpx;
  background: #fff4ef;
}

.feed-switch__item {
  min-width: 116rpx;
  height: 64rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  color: var(--text-secondary);
  font-size: 24rpx;
  font-weight: 600;
}

.feed-switch__item--active {
  background: #fff;
  color: var(--brand-primary);
  box-shadow: 0 12rpx 20rpx rgba(255, 107, 74, 0.1);
}

.feed-summary {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24rpx;
  padding: 18rpx 8rpx 0;
}

.feed-summary__count {
  flex-shrink: 0;
  font-size: 22rpx;
  color: var(--text-tertiary);
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
</style>
