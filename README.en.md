# Instant Flash Front End

Instant Flash user-facing frontend built with `uni-app + Vue 3 + TypeScript + Vite`, currently configured for H5 development.

## Stack

- `uni-app`
- `Vue 3`
- `TypeScript`
- `Vite`
- `uview-ui-next`
- `Sass`

## Local Development

```bash
pnpm install
pnpm run dev:h5
```

Default dev URL:

```text
http://localhost:5174/
```

## Project Structure

```text
src/
  pages/        page views
  static/       static assets
  styles/       global styles
  App.vue       root app component
  main.ts       app bootstrap
  pages.json    routes and tabBar config
  uni.scss      uni-app and uView global variables
```

## Conventions

- `tabBar` icons live in `src/static/tabber`
- UI components use `uview-ui-next`
- Home page route: `pages/home/index`
- Profile page route: `pages/profile/index`

## Repositories

- GitHub: `https://github.com/mhxy13867806343/instant-flash-front-end.git`
- Gitee: `https://gitee.com/fangjiayu/instant-flash-front-end.git`
