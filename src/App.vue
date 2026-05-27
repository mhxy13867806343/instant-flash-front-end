<script setup lang="ts">
import { onHide, onLaunch, onShow } from "@dcloudio/uni-app";

onLaunch(() => {
  console.log("Instant Flash Launch");
});

onShow(() => {
  console.log("Instant Flash Show");
});

onHide(() => {
  console.log("Instant Flash Hide");
});
</script>

<style lang="scss">
@import "./uni.scss";
@import "uview-ui-next/index.scss";
@import "@/styles/common.scss";

.uni-tabbar,
.uni-tabbar-border,
.uni-placeholder {
  display: none !important;
}
</style>
