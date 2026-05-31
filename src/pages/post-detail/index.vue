<template>
  <view class="page-shell detail-page">
    <view class="card-shell detail-card">
      <post-card
        v-if="post"
        :post="post"
        mode="detail"
        @like="handleLike"
        @comment="scrollToComments"
        @share="handleShare"
        @topic="handleTopicClick"
      />
      <view class="detail-note">
        <text class="detail-note__title">动态详情</text>
        <text class="detail-note__desc">这里和首页使用同一份动态状态，点赞、评论、分享和图片内容会实时同步。</text>
      </view>
    </view>

    <view v-if="post" class="card-shell detail-comments">
      <text class="section-title">评论区</text>
      <text class="section-desc">{{ commentTip }}</text>
      <feed-comment-state :count="post.commentList.length" />
      <button class="detail-comments__open" @tap="openCommentPopup">
        打开底部评论面板
      </button>
    </view>

    <feed-comment-popup
      :show="showCommentPopup"
      :post="post"
      :draft="commentDraft"
      :reply-target="replyTarget"
      :show-emoji="showEmoji"
      :emojis="emojis"
      @close="closeCommentPopup"
      @reply="replyToComment"
      @clear-reply="clearReply"
      @update:draft="commentDraft = $event"
      @toggle-emoji="toggleEmoji"
      @append-emoji="appendEmoji"
      @submit="submitComment"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import FeedCommentState from "@/components/feed-comment-state.vue";
import FeedCommentPopup from "@/components/feed-comment-popup.vue";
import PostCard from "@/components/post-card.vue";
import { useFeed } from "@/hooks/use-feed";
import { useTopicSearch } from "@/hooks/use-topic-search";

const postId = ref("post-001");
const focusType = ref("");
const commentDraft = ref("");
const replyTarget = ref("");
const showEmoji = ref(false);
const showCommentPopup = ref(false);
const emojis = ["😀", "😍", "👏", "🔥", "👍", "🥹", "🎉", "😄", "🤝", "💯"];
const { posts, loadPostComments, loadPostDetail, toggleLike, increaseShare, addComment, markBrowsed } = useFeed();
const { openTopicSearch } = useTopicSearch();

const post = computed(() => posts.value.find((item) => item.id === postId.value) || null);

const commentTip = computed(() => {
  if (focusType.value === "comment") {
    return "已从评论入口进入详情，可以直接回复或发表新的评论。";
  }
  if (focusType.value === "share") {
    return "已从分享入口进入详情，这里的分享数会和首页保持同步。";
  }
  return "评论区和首页使用同一份评论数据，新增评论会直接同步回列表。";
});

onLoad(async (options) => {
  postId.value = String(options?.id || "post-001");
  focusType.value = String(options?.focus || "");
  markBrowsed(postId.value);
  try {
    await loadPostDetail(postId.value);
    await loadPostComments(postId.value);
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : "动态加载失败",
      icon: "none",
    });
  }
  if (focusType.value === "comment") {
    openCommentPopup();
  }
});

async function handleLike() {
  try {
    const result = await toggleLike(postId.value);
    uni.showToast({
      title: result.liked ? "已点赞" : "已取消点赞",
      icon: "none",
    });
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : "操作失败",
      icon: "none",
    });
  }
}

async function submitComment() {
  const content = commentDraft.value.trim();
  if (!content) {
    uni.showToast({
      title: "先写点评论内容",
      icon: "none",
    });
    return;
  }

  try {
    await addComment(postId.value, {
      author: "当前用户",
      content,
      replyTo: replyTarget.value || undefined,
    });
    commentDraft.value = "";
    replyTarget.value = "";
    showEmoji.value = false;
    uni.showToast({
      title: "评论已发送",
      icon: "none",
    });
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : "评论失败",
      icon: "none",
    });
  }
}

function handleShare() {
  uni.showActionSheet({
    itemList: ["转发给朋友", "复制链接", "生成海报"],
    success: async () => {
      try {
        await increaseShare(postId.value);
        uni.showToast({
          title: "已分享",
          icon: "none",
        });
      } catch (error) {
        uni.showToast({
          title: error instanceof Error ? error.message : "分享失败",
          icon: "none",
        });
      }
    },
  });
}

function scrollToComments() {
  openCommentPopup();
}

function openCommentPopup() {
  showCommentPopup.value = true;
}

function closeCommentPopup() {
  commentDraft.value = "";
  replyTarget.value = "";
  showCommentPopup.value = false;
  showEmoji.value = false;
}

function replyToComment(author: string) {
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
        showEmoji.value = false;
        uni.showToast({
          title: "已清空",
          icon: "none",
        });
      }
    },
  });
}

function toggleEmoji() {
  showEmoji.value = !showEmoji.value;
}

function appendEmoji(emoji: string) {
  commentDraft.value = `${commentDraft.value}${emoji}`;
}

function handleTopicClick(topic: string) {
  openTopicSearch(topic);
}
</script>

<style scoped lang="scss">
.detail-page {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.detail-card,
.detail-comments {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 32rpx 28rpx;
}

.detail-note {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid rgba(235, 226, 218, 0.9);
}

.detail-note__title {
  font-size: 26rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.detail-note__desc {
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--text-secondary);
}

.detail-comments__open {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 80rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
  color: #fff;
  font-size: 26rpx;
  font-weight: 700;
}
</style>
