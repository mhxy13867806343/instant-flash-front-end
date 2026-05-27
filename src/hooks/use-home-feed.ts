import { computed, ref, type Ref } from "vue";
import type { FeedPost } from "@/mock/post-data";

export function useHomeFeed(posts: Ref<FeedPost[]>) {
  const keyword = ref("");
  const tabs = ["推荐", "最新"];
  const activeTab = ref("推荐");

  const filteredPosts = computed(() => {
    const q = keyword.value.trim().toLowerCase();
    const list = activeTab.value === "最新" ? [...posts.value].reverse() : posts.value;
    if (!q) {
      return list;
    }

    return list.filter((item) =>
      [item.author, item.content, item.location, ...item.topics].some((field) =>
        field.toLowerCase().includes(q)
      )
    );
  });

  return {
    keyword,
    tabs,
    activeTab,
    filteredPosts,
  };
}
