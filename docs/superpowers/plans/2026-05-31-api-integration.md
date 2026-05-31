# 即闪用户端接口接入 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将当前基于本地 mock 的用户端改造成真实调用 `http://localhost:8000` 后端接口的版本，先打通鉴权、资料、动态列表/详情/点赞/评论/分享、我的列表、消息列表。

**Architecture:** 保留现有页面和交互结构，新增统一请求层与类型映射层，让页面继续消费前端熟悉的字段结构。鉴权改成 `token + profile` 持久化，动态与个人页改成“接口拉取 + 局部状态同步”，未在 OpenAPI 中暴露的能力先做兼容占位并明确标注阻塞项。

**Tech Stack:** uni-app、Vue 3、TypeScript、uView UI Next、z-paging、Vite、FastAPI OpenAPI

---

## 文件结构

- **Create:** `src/config/env.ts`
  - 统一导出 `API_BASE_URL`、`TIANDITU_KEY`
- **Create:** `src/types/api.ts`
  - 收敛后端 `TokenResponse`、`UserProfile`、`PostOut`、`CommentOut`、`MessageOut` 等类型
- **Create:** `src/utils/http.ts`
  - 替代现有 mock request，封装 `GET/POST/PUT/DELETE`
- **Create:** `src/utils/post-mapper.ts`
  - 将后端 `PostOut/CommentOut` 映射成页面现有 `FeedPost/FeedComment`
- **Create:** `src/api/auth.ts`
  - `dev-token`、`wx-login`
- **Create:** `src/api/user.ts`
  - 我的资料、编辑资料、我的发布/点赞/评论/分享
- **Create:** `src/api/message.ts`
  - 消息列表
- **Modify:** `src/api/feed.ts`
  - 改为真实内容接口：列表、详情、评论、点赞、分享、发布、编辑、删除
- **Modify:** `src/hooks/use-auth.ts`
  - 接 token/profile 持久化与拉取资料
- **Modify:** `src/hooks/use-feed.ts`
  - 接真实动态状态容器
- **Modify:** `src/hooks/use-paging-list.ts`
  - 支持接口分页回调，不再只切本地数组
- **Modify:** `src/pages/login/index.vue`
  - 接入真实登录；H5 验证码登录缺接口时做降级
- **Modify:** `src/pages/home/index.vue`
  - 首页改用真实分页接口
- **Modify:** `src/pages/post-detail/index.vue`
  - 详情与评论改用真实接口
- **Modify:** `src/pages/profile/index.vue`
  - 资料与统计改为后端返回
- **Modify:** `src/pages/edit-profile/index.vue`
  - 保存时调用资料更新接口
- **Modify:** `src/pages/messages/index.vue`
  - 消息列表改为真实接口
- **Modify:** `src/pages/my-posts/index.vue`
- **Modify:** `src/pages/my-likes/index.vue`
- **Modify:** `src/pages/my-comments/index.vue`
- **Modify:** `src/pages/my-shares/index.vue`
- **Modify:** `src/pages/browse-history/index.vue`
  - 浏览记录继续本地保留，避免超出当前后端能力范围
- **Keep Deferred:** `src/pages/publish/index.vue`、`src/pages/topic-search/index.vue`
  - 当前 OpenAPI 未提供媒体上传、话题搜索/推荐接口，先不做强接

### 已确认的后端接口

- `POST /api/auth/dev-token`
- `POST /api/auth/wx-login`
- `GET /api/user/profile`
- `PUT /api/user/profile`
- `GET /api/posts`
- `POST /api/posts`
- `GET /api/posts/{postId}`
- `PUT /api/posts/{postId}`
- `DELETE /api/posts/{postId}`
- `POST /api/posts/{postId}/like`
- `POST /api/posts/{postId}/share`
- `GET /api/posts/{postId}/comments`
- `POST /api/posts/{postId}/comments`
- `GET /api/user/posts`
- `GET /api/user/likes`
- `GET /api/user/comments`
- `GET /api/user/shares`
- `GET /api/messages`

### 当前阻塞项

- `H5` 登录页现有“验证码登录”UI 对应接口未出现在 OpenAPI 中
- 发布页所需“媒体上传接口”未出现在 OpenAPI 中
- 话题搜索页所需“话题搜索/推荐/按话题查动态”接口未出现在 OpenAPI 中

---

### Task 1: 建立环境配置与请求层

**Files:**
- Create: `src/config/env.ts`
- Create: `src/types/api.ts`
- Create: `src/utils/http.ts`
- Modify: `src/utils/request.ts`
- Test: `pnpm run build:h5`

- [ ] **Step 1: 写环境配置文件**

```ts
// src/config/env.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
export const TIANDITU_KEY = import.meta.env.VITE_TIANDITU_KEY || "";
```

- [ ] **Step 2: 定义后端关键类型**

```ts
// src/types/api.ts
export type ApiTokenResponse = {
  accessToken: string;
  tokenType?: string;
  userId: string;
};

export type ApiUserProfile = {
  userId: string;
  phone?: string | null;
  nickname?: string | null;
  avatar?: string | null;
  gender?: string | null;
  province?: string | null;
  city?: string | null;
  district?: string | null;
  isActive?: boolean;
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
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
};
```

- [ ] **Step 3: 实现统一 HTTP 请求封装**

```ts
// src/utils/http.ts
import { API_BASE_URL } from "@/config/env";

type RequestOptions = Omit<UniNamespace.RequestOptions, "url" | "success" | "fail" | "complete">;

function getToken() {
  return uni.getStorageSync("instant-flash-token") || "";
}

export async function httpRequest<T>(url: string, options: RequestOptions = {}) {
  const token = getToken();
  const response = await uni.request({
    url: `${API_BASE_URL}${url}`,
    timeout: 15000,
    header: {
      ...(options.header || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  const [error, result] = response;
  if (error) {
    throw error;
  }

  const statusCode = result.statusCode ?? 500;
  if (statusCode >= 400) {
    throw new Error((result.data as { detail?: string })?.detail || "请求失败");
  }

  return result.data as T;
}

export const http = {
  get: <T>(url: string, data?: Record<string, unknown>) => httpRequest<T>(url, { method: "GET", data }),
  post: <T>(url: string, data?: unknown) => httpRequest<T>(url, { method: "POST", data }),
  put: <T>(url: string, data?: unknown) => httpRequest<T>(url, { method: "PUT", data }),
  delete: <T>(url: string) => httpRequest<T>(url, { method: "DELETE" }),
};
```

- [ ] **Step 4: 保留兼容导出，避免旧引用直接炸掉**

```ts
// src/utils/request.ts
export { http, httpRequest } from "@/utils/http";
```

- [ ] **Step 5: 运行构建确认基础层可用**

Run: `pnpm run build:h5`
Expected: `DONE  Build complete.`

- [ ] **Step 6: Commit**

```bash
git add src/config/env.ts src/types/api.ts src/utils/http.ts src/utils/request.ts
git commit -m "feat: add api request foundation"
```

---

### Task 2: 打通鉴权与个人资料状态

**Files:**
- Create: `src/api/auth.ts`
- Create: `src/api/user.ts`
- Modify: `src/hooks/use-auth.ts`
- Modify: `src/pages/login/index.vue`
- Test: `pnpm run build:h5`

- [ ] **Step 1: 写认证 API**

```ts
// src/api/auth.ts
import { http } from "@/utils/http";
import type { ApiTokenResponse, ApiUserProfile } from "@/types/api";

export function fetchDevToken(username = "dev-user") {
  return http.post<ApiTokenResponse>("/api/auth/dev-token", { username });
}

export function wxLogin(payload: {
  code: string;
  nickname?: string;
  avatar?: string;
  phone?: string;
  gender?: string;
}) {
  return http.post<{
    accessToken: string;
    token: string;
    tokenType?: string;
    user: ApiUserProfile;
  }>("/api/auth/wx-login", payload);
}
```

- [ ] **Step 2: 写用户资料 API**

```ts
// src/api/user.ts
import { http } from "@/utils/http";
import type { ApiPost, ApiUserProfile } from "@/types/api";

export function fetchMyProfile() {
  return http.get<ApiUserProfile>("/api/user/profile");
}

export function updateMyProfile(payload: Partial<ApiUserProfile>) {
  return http.put<ApiUserProfile>("/api/user/profile", payload);
}

export function fetchMyPosts(params: { limit: number; offset: number }) {
  return http.get<{ items: ApiPost[]; total: number; limit: number; offset: number }>("/api/user/posts", params);
}
```

- [ ] **Step 3: 改造 `use-auth.ts` 的存储结构**

```ts
type AuthProfile = {
  userId: string;
  nickname: string;
  phone: string;
  avatar: string;
  gender: string;
  avatarText: string;
};

type StoredAuthState = {
  loggedIn: boolean;
  token: string;
  profile: AuthProfile;
};
```

- [ ] **Step 4: 在 `use-auth.ts` 中接真实登录与拉资料**

```ts
async function loginByDevToken(phone: string) {
  const tokenRes = await fetchDevToken(phone || "dev-user");
  uni.setStorageSync("instant-flash-token", tokenRes.accessToken);
  const profile = await fetchMyProfile();
  applyProfile(profile);
}

async function refreshProfile() {
  const profile = await fetchMyProfile();
  applyProfile(profile);
}
```

- [ ] **Step 5: 让登录页按平台降级**

```ts
// H5 当前无验证码接口，开发环境先用 dev-token 占位
async function submit() {
  if (!isValidMobilePhone(phone.value)) {
    uni.showToast({ title: "请输入正确手机号", icon: "none" });
    return;
  }
  await loginByDevToken(phone.value);
}
```

- [ ] **Step 6: 运行构建验证**

Run: `pnpm run build:h5`
Expected: `DONE  Build complete.`

- [ ] **Step 7: Commit**

```bash
git add src/api/auth.ts src/api/user.ts src/hooks/use-auth.ts src/pages/login/index.vue
git commit -m "feat: integrate auth and profile api"
```

---

### Task 3: 建立内容映射层并改造 Feed API

**Files:**
- Create: `src/utils/post-mapper.ts`
- Modify: `src/api/feed.ts`
- Modify: `src/mock/post-data.ts`
- Test: `pnpm run build:h5`

- [ ] **Step 1: 写后端到前端卡片结构的映射**

```ts
// src/utils/post-mapper.ts
import type { ApiPost } from "@/types/api";
import type { FeedPost } from "@/mock/post-data";

export function mapApiPostToFeedPost(item: ApiPost): FeedPost {
  return {
    id: item.postId,
    author: item.nickname || "即闪用户",
    authorTag: "",
    time: item.createdAt,
    location: "",
    content: item.content,
    topics: [],
    media: (item.images || []).map((image) => (typeof image === "string" ? image : String(image))),
    likes: item.likeCount,
    comments: item.commentCount,
    shares: item.shareCount,
    liked: Boolean(item.isLiked),
    commentList: [],
  };
}
```

- [ ] **Step 2: 重写 `src/api/feed.ts`**

```ts
// src/api/feed.ts
import { http } from "@/utils/http";
import type { ApiPost, ApiUserProfile } from "@/types/api";

export function fetchFeedList(params: { limit: number; offset: number }) {
  return http.get<{ items: ApiPost[]; total: number; limit: number; offset: number }>("/api/posts", params);
}

export function fetchFeedDetail(id: string) {
  return http.get<ApiPost>(`/api/posts/${id}`);
}

export function togglePostLike(id: string) {
  return http.post<{ postId: string; isLiked: boolean; likeCount: number }>(`/api/posts/${id}/like`);
}

export function sharePost(id: string) {
  return http.post(`/api/posts/${id}/share`, {});
}
```

- [ ] **Step 3: 删掉不再需要的 mock 入口**

```ts
// src/mock/post-data.ts
// 保留 FeedPost / FeedComment 类型，移除 seed 生成逻辑与默认数据常量
```

- [ ] **Step 4: 运行构建验证**

Run: `pnpm run build:h5`
Expected: `DONE  Build complete.`

- [ ] **Step 5: Commit**

```bash
git add src/utils/post-mapper.ts src/api/feed.ts src/mock/post-data.ts
git commit -m "refactor: map backend posts to feed model"
```

---

### Task 4: 首页与详情页接真实内容接口

**Files:**
- Modify: `src/hooks/use-feed.ts`
- Modify: `src/hooks/use-paging-list.ts`
- Modify: `src/pages/home/index.vue`
- Modify: `src/pages/post-detail/index.vue`
- Test: `pnpm run build:h5`

- [ ] **Step 1: 让分页 hook 支持接口模式**

```ts
// src/hooks/use-paging-list.ts
export function usePagingList<T>(queryFn: (pageNo: number, pageSize: number) => Promise<{ items: T[]; total?: number }>) {
  const pagingRef = ref<PagingRef<T> | null>(null);
  const pagingList = ref<T[]>([]);

  async function queryList(pageNo: number, pageSize: number) {
    const result = await queryFn(pageNo, pageSize);
    pagingRef.value?.complete(result.items);
  }

  return { pagingRef, pagingList, queryList };
}
```

- [ ] **Step 2: 改造 `use-feed.ts`**

```ts
async function getPostById(id: string) {
  const detail = await fetchFeedDetail(id);
  return mapApiPostToFeedPost(detail);
}

async function toggleLike(id: string) {
  const result = await togglePostLike(id);
  const post = posts.value.find((item) => item.id === id);
  if (post) {
    post.liked = result.isLiked;
    post.likes = result.likeCount;
  }
}
```

- [ ] **Step 3: 首页改成真实分页**

```ts
const { pagingRef, pagingList: pagingPosts, queryList } = usePagingList(async (pageNo, pageSize) => {
  const offset = (pageNo - 1) * pageSize;
  const result = await fetchFeedList({ limit: pageSize, offset });
  return {
    items: result.items.map(mapApiPostToFeedPost),
    total: result.total,
  };
});
```

- [ ] **Step 4: 详情页改成真实详情 + 评论**

```ts
onLoad(async (options) => {
  const id = String(options?.id || "");
  detailPost.value = await getPostById(id);
  commentList.value = await fetchPostComments(id);
});
```

- [ ] **Step 5: 运行构建验证**

Run: `pnpm run build:h5`
Expected: `DONE  Build complete.`

- [ ] **Step 6: Commit**

```bash
git add src/hooks/use-feed.ts src/hooks/use-paging-list.ts src/pages/home/index.vue src/pages/post-detail/index.vue
git commit -m "feat: connect feed list and detail api"
```

---

### Task 5: 评论、点赞、分享接真实接口

**Files:**
- Modify: `src/api/feed.ts`
- Modify: `src/hooks/use-feed.ts`
- Modify: `src/components/feed-comment-panel.vue`
- Modify: `src/components/feed-comment-popup.vue`
- Modify: `src/pages/post-detail/index.vue`
- Test: `pnpm run build:h5`

- [ ] **Step 1: 扩展评论 API**

```ts
export function fetchPostComments(postId: string) {
  return http.get<ApiComment[]>(`/api/posts/${postId}/comments`);
}

export function createPostComment(postId: string, payload: {
  content: string;
  parentId?: string;
  replyToUserId?: string;
}) {
  return http.post<ApiComment>(`/api/posts/${postId}/comments`, payload);
}
```

- [ ] **Step 2: 评论提交改为真实请求**

```ts
async function addComment(id: string, payload: { content: string; parentId?: string; replyToUserId?: string }) {
  const comment = await createPostComment(id, payload);
  // 拉最新评论或局部插入
}
```

- [ ] **Step 3: 分享改为上报接口**

```ts
async function increaseShare(id: string) {
  await sharePost(id);
  const post = posts.value.find((item) => item.id === id);
  if (post) {
    post.shares += 1;
  }
}
```

- [ ] **Step 4: 保持现有弹层与草稿交互，只替换数据源**

```ts
// feed-comment-popup.vue / post-detail/index.vue
// 保留原组件结构，提交成功后刷新 commentList
```

- [ ] **Step 5: 运行构建验证**

Run: `pnpm run build:h5`
Expected: `DONE  Build complete.`

- [ ] **Step 6: Commit**

```bash
git add src/api/feed.ts src/hooks/use-feed.ts src/components/feed-comment-panel.vue src/components/feed-comment-popup.vue src/pages/post-detail/index.vue
git commit -m "feat: connect comment like and share api"
```

---

### Task 6: 我的页面、资料页、消息页接真实接口

**Files:**
- Modify: `src/pages/profile/index.vue`
- Modify: `src/pages/edit-profile/index.vue`
- Modify: `src/pages/messages/index.vue`
- Modify: `src/pages/my-posts/index.vue`
- Modify: `src/pages/my-likes/index.vue`
- Modify: `src/pages/my-comments/index.vue`
- Modify: `src/pages/my-shares/index.vue`
- Create: `src/api/message.ts`
- Test: `pnpm run build:h5`

- [ ] **Step 1: 写消息 API**

```ts
// src/api/message.ts
import { http } from "@/utils/http";
import type { ApiMessage } from "@/types/api";

export function fetchMessages() {
  return http.get<ApiMessage[]>("/api/messages");
}
```

- [ ] **Step 2: 个人中心改成真实 profile**

```ts
const { profile, refreshProfile } = useAuth();

onShow(() => {
  refreshProfile();
});
```

- [ ] **Step 3: 编辑资料页保存时调接口**

```ts
async function handleSave() {
  const result = await updateMyProfile({
    nickname: form.nickname,
    gender: form.gender,
    phone: form.phone,
  });
  updateProfile(result);
}
```

- [ ] **Step 4: 我的发布/点赞/评论/分享页面改成真实列表**

```ts
const { pagingRef, pagingList, queryList } = usePagingList(async (pageNo, pageSize) => {
  const offset = (pageNo - 1) * pageSize;
  const result = await fetchMyLikes({ limit: pageSize, offset });
  return { items: result.items.map(mapApiPostToFeedPost), total: result.total };
});
```

- [ ] **Step 5: 消息页改成真实接口**

```ts
onShow(async () => {
  messages.value = await fetchMessages();
});
```

- [ ] **Step 6: 运行构建验证**

Run: `pnpm run build:h5`
Expected: `DONE  Build complete.`

- [ ] **Step 7: Commit**

```bash
git add src/api/message.ts src/pages/profile/index.vue src/pages/edit-profile/index.vue src/pages/messages/index.vue src/pages/my-posts/index.vue src/pages/my-likes/index.vue src/pages/my-comments/index.vue src/pages/my-shares/index.vue
git commit -m "feat: connect profile and personal pages api"
```

---

### Task 7: 明确保留项与后续接口缺口

**Files:**
- Modify: `src/pages/publish/index.vue`
- Modify: `src/pages/topic-search/index.vue`
- Modify: `README.md`
- Test: `pnpm run build:h5`

- [ ] **Step 1: 给发布页加接口缺口提示，不误导成已接后端**

```ts
// src/pages/publish/index.vue
uni.showToast({
  title: "当前后端未提供媒体上传接口",
  icon: "none",
});
```

- [ ] **Step 2: 给话题搜索页保留 mock，但标记待后端补接口**

```ts
// src/pages/topic-search/index.vue
const useMockTopicApi = true;
```

- [ ] **Step 3: 在 README 记录当前已接与未接模块**

```md
## API 接入状态

- 已接：登录、我的资料、内容列表/详情、评论、点赞、分享、我的列表、消息
- 未接：H5 验证码登录、话题搜索、媒体上传
```

- [ ] **Step 4: 运行构建验证**

Run: `pnpm run build:h5`
Expected: `DONE  Build complete.`

- [ ] **Step 5: Commit**

```bash
git add src/pages/publish/index.vue src/pages/topic-search/index.vue README.md
git commit -m "docs: mark pending api integrations"
```

---

## Self-Review

**Spec coverage**
- 已覆盖：请求层、鉴权、资料、首页、详情、评论、点赞、分享、我的页面、消息列表。
- 缺口已显式记录：`H5 验证码登录`、`话题接口`、`媒体上传接口`。

**Placeholder scan**
- 未使用 `TBD`、`TODO`、`后续再补` 这类空描述；所有任务都给了文件、代码草图和验证命令。

**Type consistency**
- 后端内容主类型统一使用 `ApiPost`，页面展示统一映射成 `FeedPost`。
- 鉴权统一使用 `instant-flash-token` 本地存储键。

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-31-api-integration.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
