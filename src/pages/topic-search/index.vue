<template>
  <view class="page-shell topic-search-page">
    <view class="card-shell topic-search-panel">
      <u-search
        v-model="keyword"
        placeholder="搜索话题"
        :focus="true"
        :show-action="false"
        bg-color="#FFF7F3"
        placeholder-color="#9B948E"
      />
      <view v-if="showTopicSuggestPanel" class="topic-suggest-panel">
        <view class="topic-suggest-panel__head">
          <text class="topic-suggest-panel__title">话题联想</text>
          <text class="topic-suggest-panel__desc">输入 `#` 后可直接点选话题</text>
        </view>
        <view class="topic-suggest-panel__list">
          <button
            v-for="item in topicSuggestOptions"
            :key="item"
            class="topic-suggest-panel__item"
            @tap="handleTopicTap(item)"
          >
            #{{ item }}
          </button>
        </view>
      </view>

      <view class="topic-section">
        <view class="topic-section__head">
          <text class="topic-section__title">搜索结果</text>
          <text class="topic-section__desc">该部分通过接口返回，和下面推荐话题无关。</text>
        </view>
        <view v-if="searching" class="topic-loading">搜索中...</view>
        <view v-else-if="searchResults.length" class="topic-tags">
          <button
            v-for="item in searchResults"
            :key="item"
            class="topic-tag"
            :class="{ 'topic-tag--active': selectedTopics.includes(item) }"
            @tap="handleTopicTap(item)"
          >
            #{{ item }}
          </button>
        </view>
        <content-empty
          v-else-if="showSearchEmptyState"
          title="没有搜索到相关话题"
          description="换个关键词试试，或者从下面推荐话题里直接选。"
          icon="search"
        />
      </view>

      <view class="topic-section">
        <view class="topic-section__head">
          <text class="topic-section__title">推荐话题</text>
          <text class="topic-section__desc">固定推荐列表，不跟搜索结果联动。</text>
        </view>
        <view class="topic-tags">
          <button
            v-for="item in recommendedTopicOptions"
            :key="item"
            class="topic-tag"
            :class="{ 'topic-tag--active': selectedTopics.includes(item) }"
            @tap="handleTopicTap(item)"
          >
            #{{ item }}
          </button>
        </view>
      </view>

      <view v-if="!selectMode" class="topic-section">
        <view class="topic-section__head">
          <text class="topic-section__title">相关动态</text>
          <text class="topic-section__desc">{{ relatedPosts.length }} 条内容</text>
        </view>
        <view v-if="relatedPosts.length" class="topic-posts">
          <post-card
            v-for="post in relatedPosts"
            :key="post.id"
            :post="post"
            @detail="goDetail"
            @like="handleLike"
            @comment="goComment"
            @share="handleShare"
            @topic="applyTopic"
          />
        </view>
        <content-empty
          v-else
          title="暂无相关动态"
          description="换个话题继续搜，或者返回首页看看最新内容。"
          icon="file-text"
        />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { onLoad, type OnLoadOptions } from "@dcloudio/uni-app";
import ContentEmpty from "@/components/content-empty.vue";
import PostCard from "@/components/post-card.vue";
import { recommendedTopicOptions, searchTopicOptions } from "@/api/topic";
import { useFeed } from "@/hooks/use-feed";
import { useTopicSearch } from "@/hooks/use-topic-search";

const keyword = ref("");
const searchResults = ref<string[]>([]);
const searching = ref(false);
const selectMode = ref(false);
const selectedTopics = ref<string[]>([]);
const { posts, toggleLike, increaseShare } = useFeed();
const { normalizeTopic } = useTopicSearch();
const normalizedKeyword = computed(() => normalizeTopic(keyword.value));
const rawKeyword = computed(() => keyword.value.trim());
const showTopicSuggestPanel = computed(() => Boolean(rawKeyword.value));
const topicSuggestOptions = computed(() => {
  if (!showTopicSuggestPanel.value) {
    return [];
  }

  if (!normalizedKeyword.value) {
    return recommendedTopicOptions.slice(0, 8);
  }

  return searchResults.value.length ? searchResults.value : recommendedTopicOptions.slice(0, 8);
});
const showSearchEmptyState = computed(() => Boolean(normalizedKeyword.value));

const relatedPosts = computed(() => {
  const q = normalizedKeyword.value.toLowerCase();
  if (!q) {
    return posts.value.slice(0, 4);
  }

  return posts.value.filter((item) =>
    [item.author, item.content, item.location, ...item.topics].some((field) => field.toLowerCase().includes(q))
  );
});

let searchTimer: ReturnType<typeof setTimeout> | null = null;

onLoad((options: OnLoadOptions) => {
  const queryKeyword = normalizeTopic(String(options?.keyword || ""));
  keyword.value = queryKeyword;
  selectMode.value = String(options?.select || "") === "1";
  selectedTopics.value = String(options?.selected || "")
    .split(",")
    .map((item) => normalizeTopic(item))
    .filter(Boolean);

  if (queryKeyword) {
    runSearch(queryKeyword);
  }
});

watch(keyword, (value) => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }

  const nextKeyword = normalizeTopic(value);
  if (!nextKeyword) {
    searchResults.value = [];
    searching.value = false;
    return;
  }

  searchTimer = setTimeout(() => {
    runSearch(nextKeyword);
  }, 220);
});

async function runSearch(topic: string) {
  searching.value = true;
  searchResults.value = await searchTopicOptions(topic);
  searching.value = false;
}

function applyTopic(topic: string) {
  keyword.value = normalizeTopic(topic);
}

function handleTopicTap(topic: string) {
  const normalizedTopic = normalizeTopic(topic);
  if (!normalizedTopic) {
    return;
  }

  if (selectMode.value) {
    const eventChannel = uni.getOpenerEventChannel?.();
    eventChannel?.emit("topic-selected", {
      topic: normalizedTopic,
    });
    uni.navigateBack();
    return;
  }

  applyTopic(normalizedTopic);
}

function goDetail(id: string) {
  uni.navigateTo({
    url: `/pages/post-detail/index?id=${id}`,
  });
}

function goComment(id: string) {
  uni.navigateTo({
    url: `/pages/post-detail/index?id=${id}&focus=comment`,
  });
}

function handleLike(id: string) {
  const result = toggleLike(id);
  uni.showToast({
    title: result.liked ? "已点赞" : "已取消点赞",
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
</script>

<style scoped lang="scss">
.topic-search-panel {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 32rpx 28rpx;
}

.topic-section {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.topic-suggest-panel {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: -8rpx;
  padding: 20rpx;
  border-radius: 24rpx;
  background: #fff7f3;
  box-shadow: 0 16rpx 36rpx rgba(255, 107, 74, 0.08);
}

.topic-suggest-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.topic-suggest-panel__title {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.topic-suggest-panel__desc {
  font-size: 22rpx;
  color: var(--text-tertiary);
}

.topic-suggest-panel__list {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.topic-suggest-panel__item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 60rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: #fff;
  color: var(--brand-primary);
  font-size: 24rpx;
  font-weight: 700;
  box-shadow: inset 0 0 0 2rpx rgba(255, 107, 74, 0.14);
}

.topic-section__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16rpx;
}

.topic-section__title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.topic-section__desc,
.topic-loading {
  font-size: 22rpx;
  color: var(--text-tertiary);
}

.topic-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.topic-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 64rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: #fff4ef;
  color: var(--text-secondary);
  font-size: 24rpx;
}

.topic-tag--active {
  background: rgba(255, 107, 74, 0.12);
  color: var(--brand-primary);
  font-weight: 700;
}

.topic-posts {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
</style>
