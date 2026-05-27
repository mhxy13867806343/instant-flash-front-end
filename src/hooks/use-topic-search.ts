function normalizeTopic(topic: string) {
  return topic.replace(/^#/, "").trim();
}

export function useTopicSearch() {
  function openTopicSearch(topic: string) {
    const keyword = normalizeTopic(topic);
    if (!keyword) {
      return;
    }

    uni.navigateTo({
      url: `/pages/topic-search/index?keyword=${encodeURIComponent(keyword)}`,
    });
  }

  return {
    normalizeTopic,
    openTopicSearch,
  };
}
