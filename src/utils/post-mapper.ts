import type { FeedComment, FeedPost } from "@/mock/post-data";
import type { ApiComment, ApiCommentListResponse, ApiPost } from "@/types/api";
import { API_BASE_URL } from "@/config/env";

function normalizeAssetUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:") || url.startsWith("data:")) {
    return url;
  }
  const base = (API_BASE_URL || "").replace(/\/$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${base}${path}`;
}

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
    return normalizeAssetUrl(item);
  }

  if (typeof item === "object" && item !== null) {
    if ("url" in item && typeof item.url === "string") {
      return normalizeAssetUrl(item.url);
    }
    if ("src" in item && typeof item.src === "string") {
      return normalizeAssetUrl(item.src);
    }
  }

  return "";
}

function formatUserName(userId?: string | null) {
  if (!userId) {
    return "即闪用户";
  }
  return `用户${userId.slice(-4)}`;
}

function resolveCommentAuthor(comment: ApiComment) {
  return comment.nickname || formatUserName(comment.userId);
}

function resolveReplyToName(comment: ApiComment) {
  if (comment.replyToNickname) {
    return comment.replyToNickname;
  }
  if (comment.replyToUserId) {
    return formatUserName(comment.replyToUserId);
  }
  return undefined;
}

export function mapApiCommentToFeedComment(comment: ApiComment): FeedComment {
  const childSource = comment.children || comment.replies || [];

  // 把后端可能存在的多级嵌套回复拍平成两级：
  // 顶层评论下的所有后代回复都收敛到同一个 children 数组里，
  // 每条回复保留各自的 "回复 @某人" 信息。
  const flatChildren: Array<FeedComment & { _ts: number }> = [];
  function collect(list: ApiComment[]) {
    list.forEach((child) => {
      const grandChildren = child.children || child.replies || [];
      flatChildren.push({
        id: child.commentId,
        userId: child.userId,
        author: resolveCommentAuthor(child),
        avatar: child.avatar || undefined,
        time: formatRelativeTime(child.createdAt),
        content: child.content,
        replyTo: resolveReplyToName(child),
        parentId: child.parentId || undefined,
        likeCount: child.likeCount ?? 0,
        liked: Boolean(child.isLiked),
        _ts: new Date(child.createdAt).getTime() || 0,
      });
      if (grandChildren.length) {
        collect(grandChildren);
      }
    });
  }
  collect(childSource);

  // 子回复按时间从早到晚排序，符合楼中楼的阅读顺序
  flatChildren.sort((a, b) => a._ts - b._ts);
  const children: FeedComment[] = flatChildren.map(({ _ts, ...rest }) => rest);

  return {
    id: comment.commentId,
    userId: comment.userId,
    author: resolveCommentAuthor(comment),
    avatar: comment.avatar || undefined,
    time: formatRelativeTime(comment.createdAt),
    content: comment.content,
    replyTo: resolveReplyToName(comment),
    parentId: comment.parentId || undefined,
    replyCount: comment.replyCount ?? children.length,
    likeCount: comment.likeCount ?? 0,
    liked: Boolean(comment.isLiked),
    children,
  };
}

export function normalizeCommentResponse(
  response: ApiCommentListResponse | ApiComment[]
): { items: FeedComment[]; total: number; commentTotal: number; hasMore: boolean } {
  if (Array.isArray(response)) {
    const items = response.map(mapApiCommentToFeedComment);
    return { items, total: items.length, commentTotal: items.length, hasMore: false };
  }

  const rawItems = Array.isArray(response.items) ? response.items : [];
  const items = rawItems.map(mapApiCommentToFeedComment);
  const total = typeof response.total === "number" ? response.total : rawItems.length;
  const commentTotal = typeof response.commentTotal === "number" ? response.commentTotal : total;
  const hasMore = typeof response.hasMore === "boolean" ? response.hasMore : false;

  return { items, total, commentTotal, hasMore };
}

export function mapApiPostToFeedPost(post: ApiPost, commentList: FeedComment[] = []): FeedPost {
  const locationParts = [post.city, post.district, post.location].filter(Boolean);
  const locationText = locationParts.length ? locationParts.join("·") : "";
  return {
    id: post.postId,
    authorId: post.userId,
    author: post.nickname || "即闪用户",
    authorTag: "",
    time: formatRelativeTime(post.createdAt),
    location: locationText,
    content: post.content,
    topics: Array.isArray(post.topics) ? post.topics : [],
    media: Array.isArray(post.images) ? post.images.map(mapMediaItem).filter(Boolean) : [],
    likes: post.likeCount,
    comments: post.commentCount,
    shares: post.shareCount,
    liked: Boolean(post.isLiked),
    commentList,
  };
}
