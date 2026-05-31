export type ApiTokenResponse = {
  accessToken: string;
  tokenType?: string;
  userId: string;
};

export type ApiWxLoginPayload = {
  code: string;
  nickname?: string;
  avatar?: string;
  phone?: string;
  gender?: string;
  province?: string;
  city?: string;
  district?: string;
};

export type ApiUserProfile = {
  userId: string;
  openid?: string | null;
  unionid?: string | null;
  phone?: string | null;
  nickname?: string | null;
  avatar?: string | null;
  gender?: string | null;
  province?: string | null;
  city?: string | null;
  district?: string | null;
  isActive?: boolean;
  createTime?: string;
  updateTime?: string;
  lastTime?: string;
};

export type ApiUserProfileUpdate = {
  nickname?: string | null;
  avatar?: string | null;
  gender?: string | null;
  province?: string | null;
  city?: string | null;
  district?: string | null;
  phone?: string | null;
};

export type ApiWxLoginResponse = {
  accessToken: string;
  token: string;
  tokenType?: string;
  user: ApiUserProfile;
};

export type ApiPost = {
  postId: string;
  userId: string;
  nickname?: string | null;
  avatar?: string | null;
  content: string;
  images: unknown[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  status: string;
  isLiked?: boolean;
  isOwner?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ApiPostListResponse = {
  items: ApiPost[];
  total: number;
  limit: number;
  offset: number;
};

export type ApiComment = {
  commentId: string;
  postId: string;
  userId: string;
  content: string;
  parentId?: string | null;
  replyToUserId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiCommentCreatePayload = {
  content: string;
  parentId?: string;
  replyToUserId?: string;
};

export type ApiLikeResponse = {
  postId: string;
  isLiked: boolean;
  likeCount: number;
};

export type ApiMessage = {
  messageId?: string;
  id?: string;
  title?: string;
  content?: string;
  body?: string;
  type?: string;
  createdAt?: string;
  time?: string;
  isRead?: boolean;
};
