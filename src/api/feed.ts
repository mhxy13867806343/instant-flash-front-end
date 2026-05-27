import type { FeedComment, FeedPost } from "@/mock/post-data";
import { feedPosts } from "@/mock/post-data";
import { requestMock } from "@/utils/request";

function cloneComment(comment: FeedComment): FeedComment {
  return {
    ...comment,
  };
}

function clonePost(post: FeedPost): FeedPost {
  return {
    ...post,
    topics: [...post.topics],
    media: [...post.media],
    commentList: post.commentList.map(cloneComment),
  };
}

export function createFeedSeed() {
  return feedPosts.map(clonePost);
}

export function fetchFeedList() {
  return requestMock(() => createFeedSeed(), 120);
}

export function fetchFeedDetail(id: string) {
  return requestMock(() => createFeedSeed().find((item) => item.id === id) || null, 120);
}

export function fetchFeedPage(list: FeedPost[], pageNo: number, pageSize: number) {
  return requestMock(() => {
    const start = Math.max(pageNo - 1, 0) * pageSize;
    return list.slice(start, start + pageSize);
  }, 120);
}
