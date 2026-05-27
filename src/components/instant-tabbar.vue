<template>
  <view class="tabbar-shell">
    <view class="tabbar card-shell">
      <button class="tab-item" @tap="switchTo('/pages/home/index')">
        <image
          class="tab-icon"
          :src="current === 'home' ? '/static/tabber/home-selectd.png' : '/static/tabber/home.png'"
          mode="aspectFit"
        />
        <text class="tab-label" :class="{ 'tab-label--active': current === 'home' }">首页</text>
      </button>

      <button class="publish-btn" @tap="openPublish">
        <view class="publish-btn__circle">
          <text class="publish-btn__plus">+</text>
        </view>
      </button>

      <button class="tab-item" @tap="switchTo('/pages/profile/index')">
        <image
          class="tab-icon"
          :src="current === 'profile' ? '/static/tabber/my-selectd.png' : '/static/tabber/my.png'"
          mode="aspectFit"
        />
        <text class="tab-label" :class="{ 'tab-label--active': current === 'profile' }">我的</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  current: "home" | "profile";
}>();

function switchTo(url: string) {
  uni.reLaunch({ url });
}

function openPublish() {
  uni.navigateTo({
    url: "/pages/publish/index",
  });
}
</script>

<style scoped lang="scss">
.tabbar-shell {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  padding: 0 28rpx calc(env(safe-area-inset-bottom) + 18rpx);
  background: linear-gradient(180deg, rgba(246, 242, 238, 0), rgba(246, 242, 238, 0.92) 34%, #f6f2ee 100%);
}

.tabbar {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: end;
  min-height: 122rpx;
  padding: 14rpx 22rpx 12rpx;
  border-radius: 32rpx;
  background: rgba(255, 253, 251, 0.96);
  border: 0;
  box-shadow: var(--shadow-soft);
}

.tab-item,
.publish-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 8rpx;
  width: 100%;
  min-height: 96rpx;
  padding: 0;
  border: 0;
  outline: none;
  box-shadow: none;
  appearance: none;
  background: transparent;
}

.tab-icon {
  width: 48rpx;
  height: 48rpx;
}

.tab-label {
  font-size: 22rpx;
  color: var(--text-tertiary);
}

.tab-label--active {
  color: var(--brand-primary);
  font-weight: 700;
}

.publish-btn {
  transform: translateY(-26rpx);
}

.publish-btn__circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 104rpx;
  height: 104rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
  box-shadow: 0 24rpx 40rpx rgba(255, 107, 74, 0.28);
}

.publish-btn__plus {
  margin-top: -6rpx;
  color: #fff;
  font-size: 60rpx;
  line-height: 1;
  font-weight: 500;
}

</style>
