import { computed, ref } from "vue";
import type { FeedComment, FeedPost } from "@/mock/post-data";
import {
  createFeedComment,
  createFeedShare,
  fetchFeedComments,
  fetchFeedDetail,
  fetchFeedList,
  toggleFeedLike,
} from "@/api/feed";
import { mapApiCommentToFeedComment, mapApiPostToFeedPost } from "@/utils/post-mapper";

const posts = ref<FeedPost[]>([]);
const browseHistory = ref<string[]>(["post-003", "post-001", "post-002"]);
const hasBootstrapped = ref(false);
const bootstrapping = ref(false);

function updatePost(id: string, updater: (post: FeedPost) => FeedPost): FeedPost | null {
  let nextPost: FeedPost | null = null;
  posts.value = posts.value.map((item) => {
    if (item.id !== id) {
      return item;
    }
    nextPost = updater(item);
    return nextPost;
  });
  return nextPost;
}

function mergePost(nextPost: FeedPost) {
  const current = posts.value.find((item) => item.id === nextPost.id);
  if (!current) {
    posts.value = [nextPost, ...posts.value];
    return nextPost;
  }

  const mergedPost: FeedPost = {
    ...current,
    ...nextPost,
    commentList: nextPost.commentList.length ? nextPost.commentList : current.commentList,
  };
  posts.value = posts.value.map((item) => (item.id === mergedPost.id ? mergedPost : item));
  return mergedPost;
}

function mergePosts(list: FeedPost[]) {
  const postMap = new Map(posts.value.map((item) => [item.id, item]));
  list.forEach((item) => {
    const current = postMap.get(item.id);
    postMap.set(item.id, {
      ...current,
      ...item,
      commentList: item.commentList.length ? item.commentList : current?.commentList || [],
    });
  });
  posts.value = list
    .map((item) => postMap.get(item.id) || item)
    .concat(posts.value.filter((item) => !list.some((current) => current.id === item.id)));
}

export function useFeed() {
  async function ensureFeedLoaded(limit = 20) {
    if (hasBootstrapped.value || bootstrapping.value) {
      return;
    }
    bootstrapping.value = true;
    try {
      const result = await fetchFeedList({ limit, offset: 0 });
      mergePosts(result.items.map((item) => mapApiPostToFeedPost(item)));
      hasBootstrapped.value = true;
    } finally {
      bootstrapping.value = false;
    }
  }

  async function loadFeedPage(pageNo: number, pageSize: number) {
    const offset = Math.max(pageNo - 1, 0) * pageSize;
    const result = await fetchFeedList({ limit: pageSize, offset });
    const list = result.items.map((item) => mapApiPostToFeedPost(item));
    mergePosts(list);
    hasBootstrapped.value = true;
    return {
      items: list,
      total: result.total,
    };
  }

  async function loadPostDetail(id: string) {
    const detail = await fetchFeedDetail(id);
    return mergePost(mapApiPostToFeedPost(detail));
  }

  async function loadPostComments(id: string) {
    const comments = (await fetchFeedComments(id)).map(mapApiCommentToFeedComment);
    updatePost(id, (item) => ({
      ...item,
      comments: comments.length,
      commentList: comments,
    }));
    return comments;
  }

  function getPostById(id: string) {
    return computed(() => posts.value.find((item) => item.id === id) || null);
  }

  async function toggleLike(id: string) {
    const result = await toggleFeedLike(id);
    const updated: FeedPost | null = updatePost(id, (item) => {
      const liked = result.isLiked;
      return {
        ...item,
        liked,
        likes: result.likeCount,
      };
    });

    return {
      post: updated,
      liked: result.isLiked,
    };
  }

  async function increaseShare(id: string) {
    await createFeedShare(id);
    return updatePost(id, (item) => ({
      ...item,
      shares: item.shares + 1,
    }));
  }

  async function addComment(id: string, payload: Omit<FeedComment, "id" | "time">) {
    await createFeedComment(id, {
      content: payload.content,
    });
    const comments = await loadPostComments(id);
    return updatePost(id, (item) => ({
      ...item,
      comments: comments.length,
      commentList: comments,
    }));
  }

  function markBrowsed(id: string) {
    browseHistory.value = [id, ...browseHistory.value.filter((item) => item !== id)].slice(0, 12);
  }

  const historyPosts = computed(() =>
    browseHistory.value
      .map((id) => posts.value.find((item) => item.id === id))
      .filter((item): item is FeedPost => Boolean(item))
  );

  if (!hasBootstrapped.value && !bootstrapping.value) {
    ensureFeedLoaded().catch(() => undefined);
  }

  return {
    posts,
    historyPosts,
    getPostById,
    ensureFeedLoaded,
    loadFeedPage,
    loadPostDetail,
    loadPostComments,
    toggleLike,
    increaseShare,
    addComment,
    markBrowsed,
  };
}
