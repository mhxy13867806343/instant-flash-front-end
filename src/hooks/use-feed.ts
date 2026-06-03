import { computed, ref } from "vue";
import type { FeedComment, FeedPost } from "@/mock/post-data";
import type { ApiPostListParams } from "@/types/api";
import {
  createFeedComment,
  createFeedShare,
  fetchCommentReplies,
  fetchFeedComments,
  fetchFeedDetail,
  fetchFeedList,
  toggleFeedLike,
} from "@/api/feed";
import { mapApiPostToFeedPost, normalizeCommentResponse } from "@/utils/post-mapper";

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

  async function loadFeedPage(pageNo: number, pageSize: number, extra?: Partial<Omit<ApiPostListParams, "limit" | "offset">>) {
    const offset = Math.max(pageNo - 1, 0) * pageSize;
    const result = await fetchFeedList({ limit: pageSize, offset, ...extra });
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

  function countComments(list: FeedComment[]): number {
    return list.reduce((total, item) => total + 1 + countComments(item.children || []), 0);
  }

  // 合并评论分页：按 id 去重，保留已有的展开/点赞状态
  function mergeComments(current: FeedComment[], incoming: FeedComment[]): FeedComment[] {
    const map = new Map(current.map((item) => [item.id, item]));
    incoming.forEach((item) => {
      const existing = map.get(item.id);
      map.set(item.id, existing ? { ...existing, ...item } : item);
    });
    return Array.from(map.values());
  }

  async function loadPostComments(id: string, params?: { limit?: number; offset?: number; append?: boolean }) {
    const limit = params?.limit ?? 10;
    const offset = params?.offset ?? 0;
    const response = await fetchFeedComments(id, { limit, offset });
    const { items, total, commentTotal, hasMore } = normalizeCommentResponse(response);

    updatePost(id, (post) => {
      const nextList = params?.append ? mergeComments(post.commentList, items) : items;
      return {
        ...post,
        comments: commentTotal || countComments(nextList),
        commentList: nextList,
      };
    });

    return { items, total, commentTotal, hasMore };
  }

  // 加载某条顶层评论的回复（分页）
  async function loadCommentReplies(
    postId: string,
    commentId: string,
    params?: { limit?: number; offset?: number }
  ) {
    const limit = params?.limit ?? 10;
    const offset = params?.offset ?? 0;
    const response = await fetchCommentReplies(postId, commentId, { limit, offset });
    const { items, hasMore } = normalizeCommentResponse(response);

    // 将获取到的回复合并到对应顶层评论的 children 里
    updatePost(postId, (post) => ({
      ...post,
      commentList: post.commentList.map((comment) => {
        if (comment.id !== commentId) return comment;
        const existingIds = new Set((comment.children || []).map((c) => c.id));
        const newChildren = items.filter((c) => !existingIds.has(c.id));
        return {
          ...comment,
          children: [...(comment.children || []), ...newChildren],
        };
      }),
    }));

    return { items, hasMore };
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

  async function addComment(
    id: string,
    payload: { content: string; parentId?: string; replyToUserId?: string }
  ) {
    await createFeedComment(id, {
      content: payload.content,
      parentId: payload.parentId,
      replyToUserId: payload.replyToUserId,
    });
    // 重新加载第一页评论，确保新评论（含层级关系）展示出来
    await loadPostComments(id, { limit: 10, offset: 0 });
    return posts.value.find((item) => item.id === id) || null;
  }

  function markBrowsed(id: string) {
    browseHistory.value = [id, ...browseHistory.value.filter((item) => item !== id)].slice(0, 12);
  }

  // 本地切换某条评论（含嵌套回复）的点赞状态
  function toggleCommentLike(postId: string, commentId: string) {
    function updateList(list: FeedComment[]): FeedComment[] {
      return list.map((item) => {
        if (item.id === commentId) {
          const liked = !item.liked;
          const likeCount = Math.max(0, (item.likeCount || 0) + (liked ? 1 : -1));
          return { ...item, liked, likeCount };
        }
        if (item.children && item.children.length) {
          return { ...item, children: updateList(item.children) };
        }
        return item;
      });
    }

    updatePost(postId, (item) => ({
      ...item,
      commentList: updateList(item.commentList),
    }));
  }

  const historyPosts = computed(() =>
    browseHistory.value
      .map((id) => posts.value.find((item) => item.id === id))
      .filter((item): item is FeedPost => Boolean(item))
  );

  return {
    posts,
    historyPosts,
    getPostById,
    ensureFeedLoaded,
    loadFeedPage,
    loadPostDetail,
    loadPostComments,
    loadCommentReplies,
    toggleLike,
    increaseShare,
    addComment,
    toggleCommentLike,
    markBrowsed,
  };
}
