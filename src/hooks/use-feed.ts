import { computed, ref } from "vue";
import type { FeedComment, FeedPost } from "@/mock/post-data";
import { createFeedSeed } from "@/api/feed";

const posts = ref<FeedPost[]>(createFeedSeed());
const browseHistory = ref<string[]>(["post-003", "post-001", "post-002"]);

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

export function useFeed() {
  function getPostById(id: string) {
    return computed(() => posts.value.find((item) => item.id === id) || null);
  }

  function toggleLike(id: string) {
    const updated: FeedPost | null = updatePost(id, (item) => {
      const liked = !item.liked;
      return {
        ...item,
        liked,
        likes: liked ? item.likes + 1 : Math.max(item.likes - 1, 0),
      };
    });

    return {
      post: updated,
      liked: updated ? Boolean(updated.liked) : false,
    };
  }

  function increaseShare(id: string) {
    return updatePost(id, (item) => ({
      ...item,
      shares: item.shares + 1,
    }));
  }

  function addComment(id: string, payload: Omit<FeedComment, "id" | "time">) {
    return updatePost(id, (item) => ({
      ...item,
      comments: item.comments + 1,
      commentList: [
        {
          id: `${id}-${Date.now()}`,
          time: "刚刚",
          ...payload,
        },
        ...item.commentList,
      ],
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

  return {
    posts,
    historyPosts,
    getPostById,
    toggleLike,
    increaseShare,
    addComment,
    markBrowsed,
  };
}
