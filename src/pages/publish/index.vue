<template>
  <view class="page-shell safe-bottom publish-page">
    <view class="card-shell publish-panel">
      <view class="publish-hero">
        <view class="publish-hero__copy">
          <text class="section-title">发布动态</text>
          <text class="section-desc">把此刻的灵感、地点和氛围分享出去，首页会实时看到你的新内容。</text>
        </view>
        <view class="publish-hero__badge">
          <u-icon name="camera" color="#FF6B4A" size="28" />
        </view>
      </view>

      <view class="card-shell publish-card">
        <view class="publish-card__head">
          <text class="publish-card__title">动态正文</text>
          <view class="publish-card__meta">
            <button v-if="content.length" class="publish-card__clear" @tap="clearContent">清空</button>
            <text class="publish-card__count">{{ content.length }}/150</text>
          </view>
        </view>
        <textarea
          v-model="content"
          class="publish-textarea"
          maxlength="150"
          auto-height
          placeholder="分享这一刻在发生什么，长文内容也可以慢慢写..."
          placeholder-class="publish-placeholder"
          @input="handleContentInput"
        />
        <view v-if="showInlineTopicPanel" class="inline-topic-panel">
          <view class="inline-topic-panel__head">
            <text class="inline-topic-panel__title">话题联想</text>
            <text class="inline-topic-panel__desc">输入 `#` 后可直接选择话题补全</text>
          </view>
          <view v-if="inlineTopicLoading" class="inline-topic-panel__state">话题搜索中...</view>
          <view v-else-if="inlineTopicSuggestions.length" class="inline-topic-panel__list">
            <button
              v-for="item in inlineTopicSuggestions"
              :key="item"
              class="inline-topic-panel__item"
              @tap="applyInlineTopic(item)"
            >
              #{{ item }}
            </button>
          </view>
          <view v-else class="inline-topic-panel__state">暂无匹配话题，试试别的关键词</view>
        </view>
      </view>

      <view class="card-shell publish-card">
        <view class="publish-card__head">
          <text class="publish-card__title">选择话题</text>
          <text class="publish-card__hint">至少选一个，方便首页推荐</text>
        </view>
        <button class="topic-search-entry" @tap="openTopicSearchPage">
          <u-icon name="search" color="#8D867F" size="30" />
          <text class="topic-search-entry__text">点击搜索话题</text>
        </button>
        <view class="topic-picker__summary">
          <text class="topic-picker__summary-title">推荐话题</text>
          <text class="topic-picker__summary-desc">点一下加入，已选中的话题再次点击可取消。</text>
        </view>
        <view class="topic-picker__tags">
          <button
            v-for="item in topics"
            :key="item"
            class="topic-picker__tag"
            :class="{ 'topic-picker__tag--active': selectedTopics.includes(item) }"
            @tap="toggleTopic(item)"
          >
            #{{ item }}
          </button>
        </view>
      </view>

      <view class="card-shell publish-card">
        <view class="publish-card__head">
          <text class="publish-card__title">媒体区域</text>
          <text class="publish-card__hint">{{ mediaHint }}</text>
        </view>
        <view class="upload-grid">
          <template v-for="item in mediaSlots" :key="item.id">
            <view
              v-if="item.type !== 'add'"
              class="upload-cell"
              :class="{
                'upload-cell--video': item.type === 'video',
              }"
            >
              <button class="upload-cell__remove" @tap.stop="confirmRemoveMedia(item)">x</button>
              <view class="upload-cell__body" @tap.stop="previewMedia(item)">
                <image
                  v-if="item.type === 'image'"
                  class="upload-cell__thumb"
                  :src="item.previewUrl"
                  mode="aspectFill"
                />
                <view v-else class="upload-cell__video-wrap">
                  <video
                    class="upload-cell__video"
                    :src="item.previewUrl"
                    object-fit="cover"
                    :controls="false"
                    :show-center-play-btn="false"
                    :show-play-btn="false"
                    :enable-progress-gesture="false"
                    :muted="true"
                  />
                  <view class="upload-cell__video-mask">
                    <u-icon name="play-right-fill" color="#FFFFFF" size="26" />
                    <text class="upload-cell__video-text">点击预览</text>
                  </view>
                </view>
              </view>
              <view class="upload-cell__footer">
                <text class="upload-cell__name">{{ item.label }}</text>
                <text class="upload-cell__meta">{{ item.compressionText }}</text>
              </view>
            </view>
            <button
              v-else
              class="upload-cell upload-cell--add"
              @tap="openMixedMediaPicker"
            >
              <u-icon name="plus" color="#FF6B4A" size="30" />
              <text class="upload-cell__action">添加图片 / 视频</text>
              <text class="upload-cell__meta">{{ addSlotMeta }}</text>
            </button>
          </template>
        </view>
        <view v-if="visibleMediaTasks.length" class="media-task-list">
          <view class="media-task-list__head">
            <text class="media-task-list__title">处理进度</text>
            <button class="media-task-list__clear" @tap="confirmClearMediaTasks">一键清空</button>
          </view>
          <view
            v-for="task in visibleMediaTasks"
            :key="task.id"
            class="media-task-item"
          >
            <view class="media-task-item__head">
              <text class="media-task-item__name">{{ task.label }}</text>
              <view class="media-task-item__actions">
                <text class="media-task-item__progress">{{ task.progress }}%</text>
                <button class="media-task-item__close" @tap="confirmHideMediaTask(task)">
                  <image class="media-task-item__close-icon" src="/static/opt/close.png" mode="aspectFit" />
                </button>
              </view>
            </view>
            <view class="media-task-item__row">
              <text class="media-task-item__status">{{ task.statusText }}</text>
              <text class="media-task-item__detail">{{ task.detail }}</text>
            </view>
            <view class="media-task-item__bar">
              <view class="media-task-item__bar-fill" :style="{ width: `${task.progress}%` }" />
            </view>
          </view>
        </view>
      </view>

      <view class="card-shell publish-card">
        <view class="publish-card__head">
          <text class="publish-card__title">补充信息</text>
          <text class="publish-card__hint">让内容更像真实动态</text>
        </view>
        <view class="publish-meta">
          <button class="publish-meta__item" @tap="selectLocation">
            <text class="publish-meta__label">发布位置</text>
            <view class="publish-meta__value-wrap">
              <text class="publish-meta__value">{{ location }}</text>
              <u-icon name="arrow-right" color="#9B948E" size="20" />
            </view>
          </button>
          <button class="publish-meta__item" @tap="selectVisibility">
            <text class="publish-meta__label">可见范围</text>
            <view class="publish-meta__value-wrap">
              <text class="publish-meta__value">{{ visibility }}</text>
              <u-icon name="arrow-right" color="#9B948E" size="20" />
            </view>
          </button>
        </view>
      </view>
    </view>

    <view class="publish-actionbar">
      <button class="btn-ghost publish-actionbar__draft" @tap="saveDraft">存草稿</button>
      <button class="btn-primary publish-actionbar__submit" @tap="submit">发布动态</button>
    </view>

    <media-preview-popup
      :show="previewVisible"
      :items="previewAssets"
      :current="previewIndex"
      @close="closePreview"
      @update:current="previewIndex = $event"
    >
      <template #footer>
        <button v-if="previewItem" class="preview-replace-btn" @tap="handleReplaceFromPreview">重新选择</button>
      </template>
    </media-preview-popup>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onUnload } from "@dcloudio/uni-app";
import MediaPreviewPopup, { type MediaPreviewAsset } from "@/components/media-preview-popup.vue";
import { recommendedTopicOptions, searchTopicOptions } from "@/api/topic";

type MediaItem = {
  id: number;
  type: "image" | "video";
  label: string;
  previewUrl: string;
  filePath?: string;
  file?: File;
  sizeBytes: number;
  compressionText: string;
};

type MediaSlot =
  | MediaItem
  | {
      id: string;
      type: "add";
    };

type PickedMediaFile = {
  fileType: "image" | "video";
  name?: string;
  file?: File;
  size?: number;
  tempFilePath?: string;
  thumbTempFilePath?: string;
};

type MediaTask = {
  id: number;
  label: string;
  progress: number;
  statusText: string;
  detail: string;
  visible: boolean;
  completed: boolean;
};

const content = ref("");
const topics = recommendedTopicOptions;
const selectedTopics = ref<string[]>(["同城发现"]);
const mediaItems = ref<MediaItem[]>([]);
const mediaTasks = ref<MediaTask[]>([]);
const nextMediaId = ref(1);
const previewVisible = ref(false);
const previewIndex = ref(0);
const inlineTopicSuggestions = ref<string[]>([]);
const inlineTopicLoading = ref(false);
const inlineTopicRange = ref<{ start: number; end: number } | null>(null);
const locationOptions = ["杭州·滨江天街", "杭州·湖滨银泰", "杭州·运河天地", "上海·新天地"];
const visibilityOptions = ["公开", "仅好友可见", "仅自己可见"];
const location = ref(locationOptions[0]);
const visibility = ref(visibilityOptions[0]);
const showInlineTopicPanel = computed(() => inlineTopicRange.value !== null);

const videoCount = computed(() => mediaItems.value.filter((item) => item.type === "video").length);
const imageCount = computed(() => mediaItems.value.filter((item) => item.type === "image").length);
const mediaHint = computed(() => `支持图片和视频任意混传，总数最多 9 个，默认展示 1 个上传位`);
const addSlotMeta = computed(() =>
  `已选 ${imageCount.value} 张图片 / ${videoCount.value} 个视频`
);

const mediaSlots = computed<MediaSlot[]>(() => {
  const slots: MediaSlot[] = [...mediaItems.value];

  if (mediaItems.value.length < 9) {
    slots.push({
      id: "add-slot",
      type: "add",
    });
  }

  return slots;
});
const visibleMediaTasks = computed(() => mediaTasks.value.filter((item) => item.visible));
const pendingMediaTasks = computed(() => mediaTasks.value.filter((item) => !item.completed));
const previewVideoItems = computed(() => mediaItems.value.filter((item) => item.type === "video"));
const previewAssets = computed<MediaPreviewAsset[]>(() =>
  previewVideoItems.value.map((item) => ({
    type: item.type,
    label: item.label,
    src: item.previewUrl,
    description: item.compressionText,
  }))
);
const previewItem = computed(() => previewVideoItems.value[previewIndex.value] || null);

let inlineTopicSearchToken = 0;
let nextTaskId = 1;
const taskProgressTimers = new Map<number, ReturnType<typeof setInterval>>();
const taskHideTimers = new Map<number, ReturnType<typeof setTimeout>>();
const canceledTaskIds = new Set<number>();

function formatFileSize(size: number) {
  if (!size) {
    return "0KB";
  }

  if (size >= 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(1)}MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))}KB`;
}

function replaceExtension(name: string, extension: string) {
  return name.replace(/\.[^.]+$/, "") + extension;
}

function getFileExt(name = "") {
  const normalized = name.split("?")[0].toLowerCase();
  const parts = normalized.split(".");
  return parts.length > 1 ? parts.pop() || "" : "";
}

function detectMediaType(file: Partial<PickedMediaFile> & { file?: File }) {
  const mimeType = file.file?.type || "";
  if (mimeType.startsWith("video/")) {
    return "video" as const;
  }
  if (mimeType.startsWith("image/")) {
    return "image" as const;
  }

  const ext = getFileExt(file.file?.name || file.name || file.tempFilePath || "");
  const videoExts = new Set(["mp4", "mov", "m4v", "webm", "avi", "mkv", "ogg"]);
  if (videoExts.has(ext)) {
    return "video" as const;
  }

  return "image" as const;
}

function updateMediaTask(taskId: number, patch: Partial<MediaTask>) {
  mediaTasks.value = mediaTasks.value.map((item) => (item.id === taskId ? { ...item, ...patch } : item));
}

function removeMediaTask(taskId: number) {
  mediaTasks.value = mediaTasks.value.filter((item) => item.id !== taskId);
}

function clearTaskProgressTimer(taskId: number) {
  const timer = taskProgressTimers.get(taskId);
  if (timer) {
    clearInterval(timer);
    taskProgressTimers.delete(taskId);
  }
}

function clearTaskHideTimer(taskId: number) {
  const timer = taskHideTimers.get(taskId);
  if (timer) {
    clearTimeout(timer);
    taskHideTimers.delete(taskId);
  }
}

function createMediaTask(label: string) {
  const taskId = nextTaskId++;
  canceledTaskIds.delete(taskId);
  mediaTasks.value = [
    {
      id: taskId,
      label,
      progress: 0,
      statusText: "压缩处理中",
      detail: "准备压缩素材",
      visible: true,
      completed: false,
    },
    ...mediaTasks.value,
  ];
  return taskId;
}

function animateTaskProgress(taskId: number, target: number, detail: string, statusText: string) {
  clearTaskProgressTimer(taskId);
  updateMediaTask(taskId, { detail, statusText });

  const timer = setInterval(() => {
    if (canceledTaskIds.has(taskId)) {
      clearTaskProgressTimer(taskId);
      return;
    }

    const current = mediaTasks.value.find((item) => item.id === taskId);
    if (!current) {
      clearTaskProgressTimer(taskId);
      return;
    }

    if (current.progress >= target) {
      clearTaskProgressTimer(taskId);
      return;
    }

    updateMediaTask(taskId, {
      progress: Math.min(target, current.progress + 3),
      detail,
      statusText,
    });
  }, 90);

  taskProgressTimers.set(taskId, timer);
}

async function simulateUploadProgress(taskId: number) {
  animateTaskProgress(taskId, 92, "上传处理中", "上传处理中");
  await new Promise((resolve) => setTimeout(resolve, 520));
}

function finishMediaTask(taskId: number, detail: string) {
  if (canceledTaskIds.has(taskId)) {
    return;
  }

  clearTaskProgressTimer(taskId);
  clearTaskHideTimer(taskId);
  updateMediaTask(taskId, {
    progress: 100,
    detail,
    statusText: "处理完成",
    completed: true,
  });

  const timer = setTimeout(() => {
    removeMediaTask(taskId);
    taskHideTimers.delete(taskId);
  }, 900);

  taskHideTimers.set(taskId, timer);
}

function getMediaLabel(file: Record<string, any>, type: MediaItem["type"], id: number) {
  if (typeof file.file?.name === "string" && file.file.name) {
    return file.file.name;
  }

  if (typeof file.name === "string" && file.name) {
    return file.name;
  }

  return type === "video" ? `视频 ${id}` : `图片 ${id}`;
}

function isH5() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function openH5FilePicker(options: { accept: string; multiple: boolean }) {
  return new Promise<PickedMediaFile[]>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = options.accept;
    input.multiple = options.multiple;
    input.style.display = "none";

    input.onchange = () => {
      const files = Array.from(input.files || []).map((file) => ({
        fileType: detectMediaType({ file, name: file.name }),
        name: file.name,
        file,
        size: file.size,
      }));

      input.remove();
      resolve(files);
    };

    document.body.appendChild(input);
    input.click();
  });
}

function revokePreviewUrl(url?: string) {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

function discardPreparedMedia(item: Partial<MediaItem>) {
  revokePreviewUrl(item.previewUrl);
}

async function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

async function compressImageForH5(file: File) {
  const sourceUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("image-load-failed"));
      img.src = sourceUrl;
    });

    const maxSide = 1920;
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    if (!context) {
      return {
        file,
        previewUrl: URL.createObjectURL(file),
        sizeBytes: file.size,
        compressionText: `原图 ${formatFileSize(file.size)}`,
      };
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const targetType = file.type === "image/png" ? "image/png" : "image/jpeg";
    const quality = targetType === "image/png" ? undefined : 0.92;
    const blob = await canvasToBlob(canvas, targetType, quality);

    if (!blob || blob.size >= file.size * 0.98) {
      return {
        file,
        previewUrl: URL.createObjectURL(file),
        sizeBytes: file.size,
        compressionText: `原图 ${formatFileSize(file.size)}`,
      };
    }

    const compressedFile = new File(
      [blob],
      targetType === "image/png" ? replaceExtension(file.name, ".png") : replaceExtension(file.name, ".jpg"),
      { type: targetType }
    );

    return {
      file: compressedFile,
      previewUrl: URL.createObjectURL(compressedFile),
      sizeBytes: compressedFile.size,
      compressionText: `压缩后 ${formatFileSize(compressedFile.size)}`,
    };
  } finally {
    revokePreviewUrl(sourceUrl);
  }
}

function getSupportedRecorderMimeType() {
  if (typeof MediaRecorder === "undefined") {
    return "";
  }

  const mimeTypes = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  return mimeTypes.find((item) => MediaRecorder.isTypeSupported(item)) || "";
}

async function compressVideoForH5(file: File) {
  if (typeof MediaRecorder === "undefined") {
    return {
      file,
      previewUrl: URL.createObjectURL(file),
      sizeBytes: file.size,
      compressionText: `原视频 ${formatFileSize(file.size)}`,
    };
  }

  const sourceUrl = URL.createObjectURL(file);
  let recordUrl = "";
  let frameTask = 0;

  try {
    const video = document.createElement("video");
    video.src = sourceUrl;
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("video-load-failed"));
    });

    const mimeType = getSupportedRecorderMimeType();
    const captureStream = video.captureStream?.();
    if (!mimeType || !captureStream) {
      return {
        file,
        previewUrl: URL.createObjectURL(file),
        sizeBytes: file.size,
        compressionText: `原视频 ${formatFileSize(file.size)}`,
      };
    }

    const maxSide = 1280;
    const scale = Math.min(1, maxSide / Math.max(video.videoWidth || 1, video.videoHeight || 1));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round((video.videoWidth || 1) * scale));
    canvas.height = Math.max(1, Math.round((video.videoHeight || 1) * scale));
    const context = canvas.getContext("2d");
    if (!context) {
      return {
        file,
        previewUrl: URL.createObjectURL(file),
        sizeBytes: file.size,
        compressionText: `原视频 ${formatFileSize(file.size)}`,
      };
    }

    const canvasStream = canvas.captureStream(24);
    const mixedStream = new MediaStream();
    canvasStream.getVideoTracks().forEach((track) => mixedStream.addTrack(track));
    captureStream.getAudioTracks().forEach((track) => mixedStream.addTrack(track));

    const recorder = new MediaRecorder(mixedStream, {
      mimeType,
      videoBitsPerSecond: Math.min(4_000_000, Math.max(1_800_000, Math.round((file.size * 8) / Math.max(video.duration || 1, 1) * 0.62))),
    });
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size) {
        chunks.push(event.data);
      }
    };

    const recordDone = new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        resolve(new Blob(chunks, { type: mimeType }));
      };
    });

    const drawFrame = () => {
      if (video.paused || video.ended) {
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      frameTask = requestAnimationFrame(drawFrame);
    };

    recorder.start(200);
    await video.play();
    drawFrame();

    await new Promise<void>((resolve) => {
      video.onended = () => resolve();
    });

    cancelAnimationFrame(frameTask);
    recorder.stop();
    const blob = await recordDone;

    if (!blob.size || blob.size >= file.size * 0.98) {
      return {
        file,
        previewUrl: URL.createObjectURL(file),
        sizeBytes: file.size,
        compressionText: `原视频 ${formatFileSize(file.size)}`,
      };
    }

    const compressedFile = new File([blob], replaceExtension(file.name, ".webm"), {
      type: mimeType,
    });
    recordUrl = URL.createObjectURL(compressedFile);

    return {
      file: compressedFile,
      previewUrl: recordUrl,
      sizeBytes: compressedFile.size,
      compressionText: `压缩后 ${formatFileSize(compressedFile.size)}`,
    };
  } catch {
    return {
      file,
      previewUrl: URL.createObjectURL(file),
      sizeBytes: file.size,
      compressionText: `原视频 ${formatFileSize(file.size)}`,
    };
  } finally {
    cancelAnimationFrame(frameTask);
    revokePreviewUrl(sourceUrl);
  }
}

async function compressImageForApp(file: PickedMediaFile) {
  const sourcePath = file.tempFilePath || "";
  const originalSize = file.size || 0;

  if (!sourcePath || !(uni as any).compressImage) {
    return {
      previewUrl: sourcePath,
      filePath: sourcePath,
      sizeBytes: originalSize,
      compressionText: `原图 ${formatFileSize(originalSize)}`,
    };
  }

  return new Promise<{
    previewUrl: string;
    filePath: string;
    sizeBytes: number;
    compressionText: string;
  }>((resolve) => {
    (uni as any).compressImage({
      src: sourcePath,
      quality: 80,
      success: (result: { tempFilePath?: string }) => {
        const nextPath = result.tempFilePath || sourcePath;
        resolve({
          previewUrl: nextPath,
          filePath: nextPath,
          sizeBytes: originalSize,
          compressionText: originalSize ? `已压缩 ${formatFileSize(originalSize)}` : "已压缩",
        });
      },
      fail: () => {
        resolve({
          previewUrl: sourcePath,
          filePath: sourcePath,
          sizeBytes: originalSize,
          compressionText: originalSize ? `原图 ${formatFileSize(originalSize)}` : "原图",
        });
      },
    });
  });
}

async function compressVideoForApp(file: PickedMediaFile) {
  const sourcePath = file.tempFilePath || "";
  const originalSize = file.size || 0;

  if (!sourcePath || !(uni as any).compressVideo) {
    return {
      previewUrl: sourcePath,
      filePath: sourcePath,
      sizeBytes: originalSize,
      compressionText: `原视频 ${formatFileSize(originalSize)}`,
    };
  }

  return new Promise<{
    previewUrl: string;
    filePath: string;
    sizeBytes: number;
    compressionText: string;
  }>((resolve) => {
    (uni as any).compressVideo({
      src: sourcePath,
      quality: "medium",
      success: (result: { tempFilePath?: string }) => {
        const nextPath = result.tempFilePath || sourcePath;
        resolve({
          previewUrl: nextPath,
          filePath: nextPath,
          sizeBytes: originalSize,
          compressionText: originalSize ? `已压缩 ${formatFileSize(originalSize)}` : "已压缩",
        });
      },
      fail: () => {
        resolve({
          previewUrl: sourcePath,
          filePath: sourcePath,
          sizeBytes: originalSize,
          compressionText: originalSize ? `原视频 ${formatFileSize(originalSize)}` : "原视频",
        });
      },
    });
  });
}

async function prepareMediaItem(file: PickedMediaFile, id: number): Promise<MediaItem> {
  const type = detectMediaType(file);
  const label = getMediaLabel(file, type, id);

  if (isH5() && file.file) {
    const compressed = type === "video" ? await compressVideoForH5(file.file) : await compressImageForH5(file.file);
    return {
      id,
      type,
      label,
      previewUrl: compressed.previewUrl,
      file: compressed.file,
      sizeBytes: compressed.sizeBytes,
      compressionText: compressed.compressionText,
    };
  }

  const compressed = type === "video" ? await compressVideoForApp(file) : await compressImageForApp(file);
  return {
    id,
    type,
    label,
    previewUrl: compressed.previewUrl,
    filePath: compressed.filePath,
    sizeBytes: compressed.sizeBytes,
    compressionText: compressed.compressionText,
  };
}

function toggleTopic(topic: string) {
  if (selectedTopics.value.includes(topic)) {
    if (selectedTopics.value.length === 1) {
      uni.showToast({
        title: "至少保留一个话题",
        icon: "none",
      });
      return;
    }

    selectedTopics.value = selectedTopics.value.filter((item) => item !== topic);
    return;
  }

  selectedTopics.value = [...selectedTopics.value, topic];
}

function hideInlineTopicPanel() {
  inlineTopicRange.value = null;
  inlineTopicSuggestions.value = [];
  inlineTopicLoading.value = false;
}

async function updateInlineTopicSuggestions(value: string, cursor: number) {
  const contentBeforeCursor = value.slice(0, cursor);
  const matchedToken = contentBeforeCursor.match(/(^|\s)#([^\s#]*)$/);

  if (!matchedToken) {
    hideInlineTopicPanel();
    return;
  }

  const triggerIndex = contentBeforeCursor.lastIndexOf("#");
  if (triggerIndex < 0) {
    hideInlineTopicPanel();
    return;
  }

  inlineTopicRange.value = {
    start: triggerIndex,
    end: cursor,
  };

  const keyword = (matchedToken[2] || "").trim();
  if (!keyword) {
    inlineTopicLoading.value = false;
    inlineTopicSuggestions.value = recommendedTopicOptions.slice(0, 8);
    return;
  }

  const requestToken = ++inlineTopicSearchToken;
  inlineTopicLoading.value = true;
  const results = await searchTopicOptions(keyword);

  if (requestToken !== inlineTopicSearchToken) {
    return;
  }

  inlineTopicSuggestions.value = results;
  inlineTopicLoading.value = false;
}

function handleContentInput(event: { detail?: { value?: string; cursor?: number } }) {
  const value = event.detail?.value ?? "";
  const cursor = event.detail?.cursor ?? value.length;
  content.value = value;
  updateInlineTopicSuggestions(value, cursor);
}

function applyInlineTopic(topic: string) {
  const range = inlineTopicRange.value;
  if (!range) {
    return;
  }

  const normalizedTopic = topic.replace(/^#/, "").trim();
  if (!normalizedTopic) {
    return;
  }

  const prefix = content.value.slice(0, range.start);
  const suffix = content.value.slice(range.end);
  const spacer = /^\s/.test(suffix) ? "" : " ";

  content.value = `${prefix}#${normalizedTopic}${spacer}${suffix}`;
  hideInlineTopicPanel();

  if (!selectedTopics.value.includes(normalizedTopic)) {
    selectedTopics.value = [...selectedTopics.value, normalizedTopic];
  }
}

function clearContent() {
  if (!content.value) {
    return;
  }

  uni.showModal({
    title: "清空正文",
    content: "确认清空当前正文内容吗？",
    success: ({ confirm }) => {
      if (!confirm) {
        return;
      }

      content.value = "";
      hideInlineTopicPanel();
      uni.showToast({
        title: "已清空正文",
        icon: "none",
      });
    },
  });
}

function hideMediaTask(taskId: number) {
  clearTaskHideTimer(taskId);
  removeMediaTask(taskId);
}

function cancelMediaTask(taskId: number) {
  canceledTaskIds.add(taskId);
  clearTaskProgressTimer(taskId);
  clearTaskHideTimer(taskId);
  hideMediaTask(taskId);
}

function confirmHideMediaTask(task: MediaTask) {
  const content = task.completed
    ? "确认将这条处理记录从列表中隐藏吗？"
    : "当前资源还在处理中，关闭后会取消这条处理任务，确认继续吗？";

  uni.showModal({
    title: "隐藏记录",
    content,
    success: ({ confirm }) => {
      if (!confirm) {
        return;
      }

      if (task.completed) {
        hideMediaTask(task.id);
      } else {
        cancelMediaTask(task.id);
      }
      uni.showToast({
        title: task.completed ? "已隐藏处理记录" : "已取消处理任务",
        icon: "none",
      });
    },
  });
}

function confirmClearMediaTasks() {
  if (!visibleMediaTasks.value.length) {
    return;
  }

  const hasPending = visibleMediaTasks.value.some((item) => !item.completed);
  uni.showModal({
    title: "清空记录",
    content: hasPending
      ? "当前仍有资源在处理中，清空后会取消这些处理任务，确认继续吗？"
      : "确认清空当前处理记录列表吗？",
    success: ({ confirm }) => {
      if (!confirm) {
        return;
      }

      visibleMediaTasks.value.forEach((item) => {
        if (item.completed) {
          hideMediaTask(item.id);
          return;
        }

        cancelMediaTask(item.id);
      });
      uni.showToast({
        title: hasPending ? "已清空并取消处理任务" : "已清空处理记录",
        icon: "none",
      });
    },
  });
}

function openTopicSearchPage() {
  uni.navigateTo({
    url: `/pages/topic-search/index?select=1&selected=${encodeURIComponent(selectedTopics.value.join(","))}`,
    success: (res) => {
      res.eventChannel.once("topic-selected", ({ topic }: { topic: string }) => {
        toggleTopic(topic);
      });
    },
  });
}

async function appendMediaFromFiles(files: PickedMediaFile[]) {
  if (!files.length) {
    return;
  }

  const remainCount = Math.max(9 - mediaItems.value.length, 0);
  const limitedFiles = files.slice(0, remainCount);
  const nextItems = [...mediaItems.value];
  let addedCount = 0;

  for (const file of limitedFiles) {
    if (nextItems.length >= 9) {
      break;
    }

    const id = nextMediaId.value++;
    const type = detectMediaType(file);
    const label = getMediaLabel(file, type, id);
    const taskId = createMediaTask(label);
    animateTaskProgress(taskId, 58, "压缩处理中", "压缩处理中");

    const prepared = await prepareMediaItem(file, id);
    if (canceledTaskIds.has(taskId)) {
      discardPreparedMedia(prepared);
      continue;
    }

    updateMediaTask(taskId, {
      detail: prepared.compressionText,
      statusText: "压缩完成",
      progress: Math.max(60, mediaTasks.value.find((item) => item.id === taskId)?.progress || 0),
    });
    await simulateUploadProgress(taskId);
    if (canceledTaskIds.has(taskId)) {
      discardPreparedMedia(prepared);
      continue;
    }

    nextItems.push(prepared);
    addedCount += 1;
    finishMediaTask(taskId, "已完成");
  }

  mediaItems.value = nextItems;

  if (files.length > remainCount && remainCount > 0) {
    uni.showToast({
      title: `最多再选 ${remainCount} 个，已自动取前 ${remainCount} 个`,
      icon: "none",
    });
    return;
  }

  if (!addedCount) {
    uni.showToast({
      title: "最多添加 9 个媒体",
      icon: "none",
    });
  }
}

function openAppMixedMediaPicker() {
  if (mediaItems.value.length >= 9) {
    uni.showToast({
      title: "最多添加 9 个媒体",
      icon: "none",
    });
    return;
  }

  uni.chooseMedia({
    count: 9 - mediaItems.value.length,
    mediaType: ["mix"],
    sourceType: ["album"],
    success: async (result) => {
      await appendMediaFromFiles((result.tempFiles || []) as PickedMediaFile[]);
    },
  });
}

async function openMixedMediaPicker() {
  if (isH5()) {
    const files = await openH5FilePicker({
      accept: "image/*,video/*",
      multiple: true,
    });
    await appendMediaFromFiles(files);
    return;
  }

  openAppMixedMediaPicker();
}

function replaceMediaItem(nextItem: MediaItem) {
  mediaItems.value = mediaItems.value.map((media) => {
    if (media.id !== nextItem.id) {
      return media;
    }

    revokePreviewUrl(media.previewUrl);
    return nextItem;
  });
}

async function replaceMedia(item: MediaItem) {
  if (isH5()) {
    const files = await openH5FilePicker({
      accept: item.type === "video" ? "video/*" : "image/*",
      multiple: false,
    });
    const [file] = files;
    if (!file) {
      return;
    }

    const taskId = createMediaTask(item.label);
    animateTaskProgress(taskId, 58, "压缩处理中", "压缩处理中");
    const prepared = await prepareMediaItem(
      {
        ...file,
        fileType: item.type,
      },
      item.id
    );
    if (canceledTaskIds.has(taskId)) {
      discardPreparedMedia(prepared);
      return;
    }

    updateMediaTask(taskId, {
      detail: prepared.compressionText,
      statusText: "压缩完成",
      progress: Math.max(60, mediaTasks.value.find((task) => task.id === taskId)?.progress || 0),
    });
    await simulateUploadProgress(taskId);
    if (canceledTaskIds.has(taskId)) {
      discardPreparedMedia(prepared);
      return;
    }

    replaceMediaItem(prepared);
    finishMediaTask(taskId, "替换完成");
    return;
  }

  uni.chooseMedia({
    count: 1,
    mediaType: [item.type],
    sourceType: ["album"],
    success: async (result) => {
      const [file] = (result.tempFiles || []) as PickedMediaFile[];
      if (!file) {
        return;
      }

      const taskId = createMediaTask(item.label);
      animateTaskProgress(taskId, 58, "压缩处理中", "压缩处理中");
      const prepared = await prepareMediaItem(
        {
          ...file,
          fileType: item.type,
        },
        item.id
      );
      if (canceledTaskIds.has(taskId)) {
        discardPreparedMedia(prepared);
        return;
      }

      updateMediaTask(taskId, {
        detail: prepared.compressionText,
        statusText: "压缩完成",
        progress: Math.max(60, mediaTasks.value.find((task) => task.id === taskId)?.progress || 0),
      });
      await simulateUploadProgress(taskId);
      if (canceledTaskIds.has(taskId)) {
        discardPreparedMedia(prepared);
        return;
      }

      replaceMediaItem(prepared);
      finishMediaTask(taskId, "替换完成");
    },
  });
}

function previewMedia(item: MediaItem) {
  if (item.type === "image") {
    const imageItems = mediaItems.value.filter((media) => media.type === "image");
    const current = imageItems.find((media) => media.id === item.id);
    if (!current) {
      return;
    }

    uni.previewImage({
      current: current.previewUrl,
      urls: imageItems.map((media) => media.previewUrl),
      indicator: "number",
      loop: true,
    });
    return;
  }

  const index = previewVideoItems.value.findIndex((media) => media.id === item.id);
  if (index < 0) {
    return;
  }

  previewIndex.value = index;
  previewVisible.value = true;
}

function closePreview() {
  previewVisible.value = false;
}

function handleReplaceFromPreview() {
  if (!previewItem.value) {
    return;
  }

  const current = previewItem.value;
  closePreview();
  replaceMedia(current);
}

function confirmRemoveMedia(item: MediaItem) {
  uni.showModal({
    title: item.type === "video" ? "删除视频" : "删除图片",
    content: item.type === "video" ? "确认删除当前视频吗？" : "确认删除当前图片吗？",
    success: ({ confirm }) => {
      if (!confirm) {
        return;
      }

      revokePreviewUrl(item.previewUrl);
      mediaItems.value = mediaItems.value.filter((media) => media.id !== item.id);
      if (previewItem.value?.id === item.id) {
        closePreview();
      }
      uni.showToast({
        title: item.type === "video" ? "已删除视频" : "已删除图片",
        icon: "none",
      });
    },
  });
}

onUnload(() => {
  mediaItems.value.forEach((item) => revokePreviewUrl(item.previewUrl));
  Array.from(taskProgressTimers.keys()).forEach(clearTaskProgressTimer);
  Array.from(taskHideTimers.keys()).forEach(clearTaskHideTimer);
  canceledTaskIds.clear();
});

function saveDraft() {
  if (pendingMediaTasks.value.length) {
    uni.showToast({
      title: "资源仍在处理中，请稍后再操作",
      icon: "none",
    });
    return;
  }

  uni.showToast({
    title: "草稿已保存",
    icon: "none",
  });
}

function selectLocation() {
  uni.showActionSheet({
    itemList: locationOptions,
    success: ({ tapIndex }) => {
      location.value = locationOptions[tapIndex] || location.value;
      uni.showToast({
        title: `已切换到${location.value}`,
        icon: "none",
      });
    },
  });
}

function selectVisibility() {
  uni.showActionSheet({
    itemList: visibilityOptions,
    success: ({ tapIndex }) => {
      visibility.value = visibilityOptions[tapIndex] || visibility.value;
      uni.showToast({
        title: `已设置为${visibility.value}`,
        icon: "none",
      });
    },
  });
}

function submit() {
  if (pendingMediaTasks.value.length) {
    uni.showToast({
      title: "资源仍在上传处理中，请等待完成后再发布",
      icon: "none",
    });
    return;
  }

  if (!content.value.trim()) {
    uni.showToast({
      title: "请先输入动态正文",
      icon: "none",
    });
    return;
  }

  uni.showToast({
    title: "演示版发布成功",
    icon: "success",
  });
}
</script>

<style scoped lang="scss">
.publish-page {
  padding-top: 32rpx;
  padding-bottom: calc(env(safe-area-inset-bottom) + 196rpx);
}

.publish-panel {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 32rpx 28rpx;
}

.publish-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
}

.publish-hero__copy {
  min-width: 0;
  flex: 1;
}

.publish-hero__copy .section-title,
.publish-hero__copy .section-desc {
  display: block;
}

.publish-hero__badge {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border-radius: 24rpx;
  background: rgba(255, 107, 74, 0.12);
}

.publish-card {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 24rpx;
}

.publish-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.publish-card__meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.publish-card__title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.publish-card__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 48rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background: #fff4ef;
  color: var(--brand-primary);
  font-size: 22rpx;
  font-weight: 700;
  border: none;
}

.publish-card__hint,
.publish-card__count {
  font-size: 22rpx;
  color: var(--text-tertiary);
}

.publish-textarea {
  width: 100%;
  min-height: 280rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #fff7f3;
  font-size: 28rpx;
  line-height: 1.8;
}

.publish-placeholder {
  color: #9b948e;
}

.inline-topic-panel {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 20rpx;
  border-radius: 24rpx;
  background: #fff7f3;
  box-shadow: 0 16rpx 36rpx rgba(255, 107, 74, 0.08);
}

.inline-topic-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.inline-topic-panel__title {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.inline-topic-panel__desc,
.inline-topic-panel__state {
  font-size: 22rpx;
  color: var(--text-tertiary);
}

.inline-topic-panel__list {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.inline-topic-panel__item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 60rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: #fff;
  color: var(--brand-primary);
  font-size: 24rpx;
  font-weight: 700;
  box-shadow: inset 0 0 0 2rpx rgba(255, 107, 74, 0.14);
}

.topic-picker__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.topic-picker__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.topic-picker__summary-title {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.topic-picker__summary-desc,
.topic-picker__tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 60rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: #fff4ef;
  color: var(--text-secondary);
  font-size: 24rpx;
}

.topic-search-entry {
  display: flex;
  align-items: center;
  gap: 16rpx;
  width: 100%;
  height: 84rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: #fff7f3;
  color: var(--text-secondary);
}

.topic-search-entry__text {
  font-size: 24rpx;
  color: #8d867f;
}

.topic-picker__tag--active {
  background: rgba(255, 107, 74, 0.12);
  color: var(--brand-primary);
  font-weight: 700;
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14rpx;
}

.upload-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  min-height: 172rpx;
  padding: 14rpx;
  border: 2rpx dashed rgba(255, 107, 74, 0.24);
  border-radius: 24rpx;
  background: rgba(255, 244, 239, 0.75);
  color: var(--text-secondary);
  overflow: hidden;
}

.upload-cell--add {
  align-items: center;
  justify-content: center;
}

.upload-cell--video {
  grid-column: span 2;
  min-height: 188rpx;
}

.upload-cell__remove {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44rpx;
  height: 44rpx;
  border-radius: 999rpx;
  background: rgba(35, 29, 26, 0.72);
  color: #fff;
  font-size: 24rpx;
  line-height: 1;
  border: none;
}

.upload-cell__body {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 112rpx;
  border-radius: 18rpx;
  overflow: hidden;
  background: #f3e7e0;
}

.upload-cell__thumb,
.upload-cell__video {
  width: 100%;
  height: 100%;
  min-height: 112rpx;
}

.upload-cell__video {
  pointer-events: none;
}

.upload-cell__video-wrap {
  position: relative;
  width: 100%;
  min-height: 128rpx;
}

.upload-cell__video-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  background: linear-gradient(180deg, rgba(35, 29, 26, 0.16), rgba(35, 29, 26, 0.42));
  pointer-events: none;
}

.upload-cell__video-text {
  font-size: 22rpx;
  font-weight: 700;
  color: #fff;
}

.upload-cell__footer {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.upload-cell__name {
  font-size: 22rpx;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.upload-cell__meta {
  font-size: 20rpx;
  color: var(--text-tertiary);
}

.media-task-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  margin-top: 8rpx;
  padding: 20rpx;
  border-radius: 24rpx;
  background: #fff7f3;
}

.media-task-list__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.media-task-list__title {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.media-task-list__clear {
  padding: 0;
  background: transparent;
  border: none;
  font-size: 22rpx;
  font-weight: 700;
  color: var(--brand-primary);
}

.media-task-item {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.media-task-item__head,
.media-task-item__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.media-task-item__actions {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.media-task-item__name {
  min-width: 0;
  flex: 1;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media-task-item__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  padding: 0;
  border: none;
  background: transparent;
}

.media-task-item__close-icon {
  width: 24rpx;
  height: 24rpx;
}

.media-task-item__progress,
.media-task-item__status,
.media-task-item__detail {
  font-size: 22rpx;
  color: var(--text-tertiary);
}

.media-task-item__detail {
  max-width: 280rpx;
  text-align: right;
}

.media-task-item__bar {
  height: 10rpx;
  border-radius: 999rpx;
  background: rgba(255, 107, 74, 0.12);
  overflow: hidden;
}

.media-task-item__bar-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ff8d70, #ff6b4a);
}

.preview-replace-btn {
  width: 100%;
}

.publish-meta {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.publish-meta__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  width: 100%;
  padding: 18rpx 20rpx;
  border-radius: 20rpx;
  background: #fff7f3;
  text-align: left;
}

.publish-meta__label {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.publish-meta__value-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.publish-meta__value {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.publish-actionbar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  gap: 18rpx;
  padding: 20rpx 28rpx calc(env(safe-area-inset-bottom) + 24rpx);
  background: rgba(246, 242, 238, 0.96);
  backdrop-filter: blur(18px);
}

.publish-actionbar__draft {
  flex: 1;
}

.publish-actionbar__submit {
  flex: 1.4;
}
</style>
