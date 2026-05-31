import type { FeedComment, FeedPost } from "@/mock/post-data";
import type { ApiComment, ApiPost } from "@/types/api";

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const diffMinutes = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 60) {
    return `${diffMinutes} 分钟前`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} 小时前`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} 天前`;
}

function mapMediaItem(item: unknown) {
  if (typeof item === "string") {
    return item;
  }

  if (typeof item === "object" && item !== null) {
    if ("url" in item && typeof item.url === "string") {
      return item.url;
    }
    if ("src" in item && typeof item.src === "string") {
      return item.src;
    }
  }

  return String(item ?? "");
}

function formatUserName(userId?: string | null) {
  if (!userId) {
    return "即闪用户";
  }
  return `用户${userId.slice(-4)}`;
}

export function mapApiCommentToFeedComment(comment: ApiComment): FeedComment {
  return {
    id: comment.commentId,
    author: formatUserName(comment.userId),
    time: formatRelativeTime(comment.createdAt),
    content: comment.content,
    replyTo: comment.replyToUserId ? formatUserName(comment.replyToUserId) : undefined,
  };
}

export function mapApiPostToFeedPost(post: ApiPost, commentList: FeedComment[] = []): FeedPost {
  return {
    id: post.postId,
    author: post.nickname || "即闪用户",
    authorTag: "",
    time: formatRelativeTime(post.createdAt),
    location: "",
    content: post.content,
    topics: [],
    media: Array.isArray(post.images) ? post.images.map(mapMediaItem).filter(Boolean) : [],
    likes: post.likeCount,
    comments: post.commentCount,
    shares: post.shareCount,
    liked: Boolean(post.isLiked),
    commentList,
  };
}
