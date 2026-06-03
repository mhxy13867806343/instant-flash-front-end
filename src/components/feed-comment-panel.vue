<template>
  <view class="comment-panel">
    <feed-comment-state :count="totalCount" />

    <scroll-view v-if="post.commentList.length" scroll-y class="comment-panel__list-scroll">
      <view class="comment-panel__list">
        <view v-for="item in post.commentList" :key="item.id" class="comment-panel__thread">
          <view class="comment-row">
            <view class="comment-row__avatar" :style="avatarStyle(item)">
              <text v-if="!item.avatar" class="comment-row__avatar-text">{{ avatarText(item) }}</text>
            </view>
            <view class="comment-row__body" @tap.stop="emit('reply', item)">
              <view class="comment-row__name-line">
                <text class="comment-row__name">{{ item.author }}</text>
                <text v-if="isAuthor(item)" class="comment-row__badge">作者</text>
              </view>
              <text class="comment-row__content">{{ item.content }}</text>
              <view class="comment-row__footer">
                <text class="comment-row__time">{{ item.time }}</text>
                <button class="comment-row__action" @tap.stop="emit('reply', item)">
                  <u-icon name="chat" :color="replyTargetId === item.id ? '#FF6B4A' : '#9B948E'" size="30" />
                  <text v-if="item.replyCount" class="comment-row__action-text">{{ item.replyCount }}</text>
                </button>
                <button class="comment-row__action" @tap.stop="emit('like-comment', item)">
                  <u-icon :name="item.liked ? 'heart-fill' : 'heart'" :color="item.liked ? '#FF6B4A' : '#9B948E'" size="30" />
                  <text v-if="item.likeCount" class="comment-row__action-text">{{ item.likeCount }}</text>
                </button>
              </view>

              <view v-if="showRepliesSection(item)" class="comment-row__replies">
                <view
                  v-for="child in visibleReplies(item)"
                  :key="child.id"
                  class="comment-row comment-row--reply"
                >
                  <view class="comment-row__avatar comment-row__avatar--sm" :style="avatarStyle(child)">
                    <text v-if="!child.avatar" class="comment-row__avatar-text">{{ avatarText(child) }}</text>
                  </view>
                  <view class="comment-row__body" @tap.stop="emit('reply', child)">
                    <view class="comment-row__name-line">
                      <text class="comment-row__name">{{ child.author }}</text>
                      <text v-if="isAuthor(child)" class="comment-row__badge">作者</text>
                    </view>
                    <text class="comment-row__content">
                      <text v-if="child.replyTo" class="comment-row__replyto">回复 @{{ child.replyTo }}：</text>{{ child.content }}
                    </text>
                    <view class="comment-row__footer">
                      <text class="comment-row__time">{{ child.time }}</text>
                      <button class="comment-row__action" @tap.stop="emit('reply', child)">
                        <u-icon name="chat" :color="replyTargetId === child.id ? '#FF6B4A' : '#9B948E'" size="28" />
                      </button>
                      <button class="comment-row__action" @tap.stop="emit('like-comment', child)">
                        <u-icon :name="child.liked ? 'heart-fill' : 'heart'" :color="child.liked ? '#FF6B4A' : '#9B948E'" size="28" />
                        <text v-if="child.likeCount" class="comment-row__action-text">{{ child.likeCount }}</text>
                      </button>
                    </view>
                  </view>
                </view>

                <button
                  v-if="showExpandBtn(item)"
                  class="comment-row__more-replies"
                  @tap.stop="handleExpand(item)"
                >
                  {{ expandBtnText(item) }}
                </button>
                <button
                  v-else-if="showCollapseBtn(item)"
                  class="comment-row__more-replies"
                  @tap.stop="collapseReplies(item.id)"
                >
                  收起回复
                </button>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="comment-panel__loadmore">
        <button
          v-if="hasMore"
          class="comment-panel__loadmore-btn"
          :disabled="loadingMore"
          @tap.stop="emit('load-more')"
        >
          {{ loadingMore ? "加载中..." : "查看更多评论" }}
        </button>
        <text v-else-if="post.commentList.length" class="comment-panel__loadmore-end">没有更多评论了</text>
      </view>
    </scroll-view>

    <view class="comment-panel__composer">
      <view v-if="replyTargetId" class="comment-panel__replybar">
        <text class="comment-panel__replybar-text">正在回复 @{{ replyTargetName }}</text>
        <button class="comment-panel__replybar-cancel" @tap.stop="emit('clear-reply')">
          <image class="comment-panel__replybar-cancel-icon" src="/static/opt/close.png" mode="aspectFit" />
        </button>
      </view>

      <view class="comment-panel__editor">
        <input
          :value="draft"
          class="comment-panel__input"
          :placeholder="replyTargetId ? `回复 @${replyTargetName}` : '说点什么...'"
          placeholder-class="comment-panel__placeholder"
          @input="handleInput"
        />
        <button class="comment-panel__emoji-btn" @tap.stop="emit('toggle-emoji')">😊</button>
        <button class="comment-panel__submit" @tap.stop="emit('submit')">发送</button>
      </view>

      <view v-if="showEmoji" class="comment-panel__emoji">
        <button
          v-for="emoji in emojis"
          :key="emoji"
          class="comment-panel__emoji-item"
          @tap.stop="emit('append-emoji', emoji)"
        >
          {{ emoji }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import FeedCommentState from "@/components/feed-comment-state.vue";
import type { FeedComment, FeedPost } from "@/mock/post-data";

const props = withDefaults(
  defineProps<{
    post: FeedPost;
    draft: string;
    replyTargetId: string;
    replyTargetName: string;
    showEmoji: boolean;
    emojis: string[];
    hasMore?: boolean;
    loadingMore?: boolean;
  }>(),
  {
    hasMore: false,
    loadingMore: false,
  }
);

const emit = defineEmits<{
  reply: [comment: FeedComment];
  "like-comment": [comment: FeedComment];
  "expand-replies": [comment: FeedComment];
  "load-more": [];
  "clear-reply": [];
  "update:draft": [value: string];
  "toggle-emoji": [];
  "append-emoji": [emoji: string];
  submit: [];
}>();

const collapsedReplyCount = 2;
const expandedThreads = ref<string[]>([]);

function countComments(list: FeedComment[]): number {
  return list.reduce((total, item) => total + 1 + countComments(item.children || []), 0);
}

const totalCount = computed(() => props.post.comments || countComments(props.post.commentList));

function isExpanded(id: string) {
  return expandedThreads.value.includes(id);
}

function expandReplies(id: string) {
  if (!expandedThreads.value.includes(id)) {
    expandedThreads.value = [...expandedThreads.value, id];
  }
}

function collapseReplies(id: string) {
  expandedThreads.value = expandedThreads.value.filter((item) => item !== id);
}

function handleExpand(comment: FeedComment) {
  // 标记展开（让已有 children 全部显示）
  expandReplies(comment.id);
  // 通知页面去请求后端加载更多
  emit("expand-replies", comment);
}

// 是否显示回复区域（replyCount > 0 或已有 children）
function showRepliesSection(comment: FeedComment) {
  const childCount = (comment.children || []).length;
  return childCount > 0;
}

// 显示"展开"按钮的条件：
// 1. 未展开 且 replyCount > 已显示的条数（collapsedReplyCount）
// 2. 已展开 但后端还有更多未加载的回复（replyCount > children.length）
function showExpandBtn(comment: FeedComment) {
  const childCount = (comment.children || []).length;
  const totalReplies = comment.replyCount || childCount;

  if (!isExpanded(comment.id)) {
    // 折叠状态：children 超过折叠数，或后端还有未加载的
    return totalReplies > collapsedReplyCount;
  }

  // 展开状态：后端还有更多回复未加载
  return totalReplies > childCount;
}

function expandBtnText(comment: FeedComment) {
  const childCount = (comment.children || []).length;
  const totalReplies = comment.replyCount || childCount;

  if (!isExpanded(comment.id)) {
    // 折叠态：展示"展开其余 X 条回复"
    return `展开其余 ${totalReplies - collapsedReplyCount} 条回复`;
  }

  // 展开态但后端还有更多：
  return `查看更多回复（剩余 ${totalReplies - childCount} 条）`;
}

// 显示"收起回复"：已展开、所有回复已加载完、children > collapsedReplyCount
function showCollapseBtn(comment: FeedComment) {
  const childCount = (comment.children || []).length;
  const totalReplies = comment.replyCount || childCount;

  // 已展开 且 全部加载完（没有更多） 且 确实有超过折叠数的回复
  return isExpanded(comment.id) && totalReplies <= childCount && childCount > collapsedReplyCount;
}

function visibleReplies(comment: FeedComment) {
  const children = comment.children || [];
  if (isExpanded(comment.id) || children.length <= collapsedReplyCount) {
    return children;
  }
  return children.slice(0, collapsedReplyCount);
}

function isAuthor(comment: FeedComment) {
  return Boolean(props.post.authorId && comment.userId && comment.userId === props.post.authorId);
}

function avatarText(comment: FeedComment) {
  return comment.author.slice(0, 1);
}

function avatarStyle(comment: FeedComment) {
  if (comment.avatar) {
    return {
      backgroundImage: `url(${comment.avatar})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return {};
}

function handleInput(event: InputEvent & { detail?: { value?: string } }) {
  emit("update:draft", event.detail?.value || "");
}
</script>

<style scoped lang="scss">
.comment-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: 8rpx;
  border-top: 1rpx solid rgba(235, 226, 218, 0.9);
}

.comment-panel__list-scroll {
  flex: 1;
  min-height: 0;
  margin-top: 16rpx;
}

.comment-panel__list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding-bottom: 12rpx;
}

.comment-panel__thread {
  display: flex;
  flex-direction: column;
}

.comment-row {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
  padding: 20rpx 4rpx;
}

.comment-row--reply {
  padding: 16rpx 0;
}

.comment-row__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff8d5f, #ff6b4a);
  overflow: hidden;
}

.comment-row__avatar--sm {
  width: 52rpx;
  height: 52rpx;
}

.comment-row__avatar-text {
  color: #fff;
  font-size: 26rpx;
  font-weight: 700;
}

.comment-row__body {
  min-width: 0;
  flex: 1;
}

.comment-row__name-line {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.comment-row__name {
  font-size: 24rpx;
  font-weight: 600;
  color: var(--text-tertiary);
}

.comment-row__badge {
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
  background: rgba(45, 130, 240, 0.12);
  color: #2d82f0;
  font-size: 20rpx;
  font-weight: 600;
}

.comment-row__content {
  display: block;
  margin-top: 10rpx;
  font-size: 28rpx;
  line-height: 1.6;
  color: var(--text-primary);
}

.comment-row__replyto {
  color: #5d7aa6;
  font-weight: 600;
}

.comment-row__footer {
  display: flex;
  align-items: center;
  gap: 32rpx;
  margin-top: 14rpx;
}

.comment-row__time {
  font-size: 22rpx;
  color: var(--text-tertiary);
}

.comment-row__action {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  height: 40rpx;
  padding: 0;
  border: 0;
  background: transparent;
  line-height: 1;
}

.comment-row__action::after {
  border: none;
}

.comment-row__action-text {
  font-size: 22rpx;
  color: var(--text-tertiary);
}

.comment-row__replies {
  display: flex;
  flex-direction: column;
  margin-top: 4rpx;
}

.comment-row__more-replies {
  align-self: flex-start;
  height: 48rpx;
  padding: 0 8rpx;
  border: 0;
  background: transparent;
  color: var(--brand-primary);
  font-size: 24rpx;
  font-weight: 600;
  line-height: 48rpx;
}

.comment-row__more-replies::after {
  border: none;
}

.comment-panel__loadmore {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0 8rpx;
}

.comment-panel__loadmore-btn {
  height: 64rpx;
  padding: 0 32rpx;
  border-radius: 999rpx;
  background: #fff4ef;
  color: var(--brand-primary);
  font-size: 24rpx;
  font-weight: 600;
}

.comment-panel__loadmore-btn::after {
  border: none;
}

.comment-panel__loadmore-end {
  font-size: 22rpx;
  color: var(--text-tertiary);
}

.comment-panel__replybar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-top: 16rpx;
  padding: 16rpx 20rpx;
  border-radius: 18rpx;
  background: rgba(255, 107, 74, 0.08);
}

.comment-panel__composer {
  flex-shrink: 0;
  margin-top: 16rpx;
  padding-top: 16rpx;
  background: #fffdfb;
  border-top: 1rpx solid rgba(235, 226, 218, 0.9);
}

.comment-panel__replybar-text {
  min-width: 0;
  flex: 1;
  font-size: 22rpx;
  color: var(--brand-primary);
  font-weight: 700;
}

.comment-panel__replybar-cancel {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52rpx;
  height: 52rpx;
  padding: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
}

.comment-panel__replybar-cancel-icon {
  width: 22rpx;
  height: 22rpx;
}

.comment-panel__editor {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 16rpx;
}

.comment-panel__input {
  flex: 1;
  height: 76rpx;
  min-width: 0;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: #fff7f3;
  font-size: 24rpx;
}

.comment-panel__placeholder {
  color: #9b948e;
}

.comment-panel__emoji-btn {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: #fff7f3;
  font-size: 30rpx;
}

.comment-panel__submit {
  flex-shrink: 0;
  height: 76rpx;
  padding: 0 28rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
}

.comment-panel__emoji {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
  padding: 18rpx;
  border-radius: 20rpx;
  background: #fff7f3;
}

.comment-panel__emoji-item {
  width: 72rpx;
  height: 72rpx;
  border-radius: 18rpx;
  background: #fff;
  font-size: 32rpx;
}
</style>
