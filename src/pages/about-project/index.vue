<template>
  <view class="page-shell about-project-page">
    <view class="card-shell intro-card">
      <text class="intro-card__title">即闪 · 项目介绍</text>
      <text class="intro-card__desc">一个用于分享附近动态、即时灵感的社交项目，前后端 + 后台管理系统全栈实现。</text>
    </view>

    <view v-for="group in stacks" :key="group.title" class="card-shell stack-card">
      <view class="stack-card__head">
        <text class="stack-card__title">{{ group.title }}</text>
        <text class="stack-card__subtitle">{{ group.subtitle }}</text>
      </view>
      <view class="stack-tags">
        <button
          v-for="item in group.items"
          :key="item.name"
          class="stack-tag"
          @tap="openLink(item.url)"
        >
          <text class="stack-tag__name">{{ item.name }}</text>
          <text v-if="item.url" class="stack-tag__link">↗</text>
        </button>
      </view>
    </view>

    <view class="card-shell tools-card">
      <text class="tools-card__title">开发使用的 AI 工具</text>
      <view class="stack-tags">
        <button
          v-for="tool in aiTools"
          :key="tool.name"
          class="stack-tag stack-tag--ai"
          @tap="openLink(tool.url)"
        >
          <text class="stack-tag__name">{{ tool.name }}</text>
          <text v-if="tool.url" class="stack-tag__link">↗</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { openExternalLink } from "@/utils/link";

type StackItem = { name: string; url?: string };

const stacks: { title: string; subtitle: string; items: StackItem[] }[] = [
  {
    title: "前端（用户端）",
    subtitle: "uni-app 跨端，H5 / 小程序",
    items: [
      { name: "Vue 3", url: "https://cn.vuejs.org/" },
      { name: "uni-app", url: "https://uniapp.dcloud.net.cn/" },
      { name: "TypeScript", url: "https://www.typescriptlang.org/" },
      { name: "Vite", url: "https://cn.vitejs.dev/" },
      { name: "uview-ui-next", url: "https://www.uviewui.com/" },
      { name: "z-paging", url: "https://z-paging.zxlee.cn/" },
      { name: "day.js", url: "https://dayjs.fenxianglu.cn/" },
      { name: "Sass", url: "https://sass-lang.com/" },
    ],
  },
  {
    title: "后端",
    subtitle: "Python FastAPI",
    items: [
      { name: "Python", url: "https://www.python.org/" },
      { name: "FastAPI", url: "https://fastapi.tiangolo.com/zh/" },
      { name: "Pydantic", url: "https://docs.pydantic.dev/" },
      { name: "Uvicorn", url: "https://www.uvicorn.org/" },
      { name: "天地图 API", url: "https://lbs.tianditu.gov.cn/" },
    ],
  },
  {
    title: "后台管理系统",
    subtitle: "Vue 3 + Element Plus",
    items: [
      { name: "Vue 3", url: "https://cn.vuejs.org/" },
      { name: "Element Plus", url: "https://element-plus.org/zh-CN/" },
      { name: "Vite", url: "https://cn.vitejs.dev/" },
      { name: "ECharts 图表", url: "https://echarts.apache.org/zh/index.html" },
      { name: "Three.js 3D", url: "https://threejs.org/" },
      { name: "Pinia", url: "https://pinia.vuejs.org/zh/" },
    ],
  },
];

const aiTools: StackItem[] = [
  { name: "Codex", url: "https://openai.com/codex/" },
  { name: "Kiro", url: "https://kiro.dev/" },
  { name: "Trae 国际版", url: "https://www.trae.ai/" },
  { name: "Trae SOLO", url: "https://www.trae.ai/solo" },
  { name: "Antigravity", url: "https://antigravity.google/" },
];

function openLink(url?: string) {
  if (url) openExternalLink(url);
}
</script>

<style scoped lang="scss">
.about-project-page {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 24rpx;
}

.intro-card {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding: 32rpx 28rpx;
}

.intro-card__title {
  font-size: 38rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.intro-card__desc {
  font-size: 26rpx;
  line-height: 1.7;
  color: var(--text-secondary);
}

.stack-card,
.tools-card {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 32rpx 28rpx;
}

.stack-card__head {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.stack-card__title,
.tools-card__title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.stack-card__subtitle {
  font-size: 22rpx;
  color: var(--text-tertiary);
}

.stack-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.stack-tag {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  height: 64rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: #fff4ef;
  line-height: 1;
}

.stack-tag::after {
  border: none;
}

.stack-tag--ai {
  background: rgba(61, 124, 255, 0.1);
}

.stack-tag__name {
  font-size: 24rpx;
  font-weight: 600;
  color: var(--brand-primary);
}

.stack-tag--ai .stack-tag__name {
  color: #3d7cff;
}

.stack-tag__link {
  font-size: 22rpx;
  color: var(--text-tertiary);
}
</style>
