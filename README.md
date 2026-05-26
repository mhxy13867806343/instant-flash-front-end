# Instant Flash Front End

即闪用户端前端项目，基于 `uni-app + Vue 3 + TypeScript + Vite` 构建，当前支持 H5 开发调试。

## 技术栈

- `uni-app`
- `Vue 3`
- `TypeScript`
- `Vite`
- `uview-ui-next`
- `Sass`

## 本地开发

```bash
pnpm install
pnpm run dev:h5
```

默认开发地址：

```text
http://localhost:5174/
```

## 目录说明

```text
src/
  pages/        页面目录
  static/       静态资源
  styles/       全局样式
  App.vue       应用入口组件
  main.ts       应用启动入口
  pages.json    路由与 tabBar 配置
  uni.scss      uni-app 与 uView 全局变量
```

## 当前约定

- 底部 `tabBar` 图标资源位于 `src/static/tabber`
- UI 组件库使用 `uview-ui-next`
- 首页路径为 `pages/home/index`
- 我的页路径为 `pages/profile/index`

## 仓库地址

- GitHub: `https://github.com/mhxy13867806343/instant-flash-front-end.git`
- Gitee: `https://gitee.com/fangjiayu/instant-flash-front-end.git`
