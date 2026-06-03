import { ref, watch, type ComputedRef, type Ref } from "vue";
import { requestMock } from "@/utils/request";

type PagingRef<T> = {
  complete: (list: T[]) => void;
  reload: () => void;
};

type QueryResult<T> = {
  items: T[];
  total?: number;
};

type PagingQuery<T> = (pageNo: number, pageSize: number) => Promise<QueryResult<T>>;

function isQueryMode<T>(source: Ref<T[]> | ComputedRef<T[]> | PagingQuery<T>): source is PagingQuery<T> {
  return typeof source === "function";
}

type ItemWithId = { id: string | number; [key: string]: unknown };

function hasId(item: unknown): item is ItemWithId {
  return typeof item === "object" && item !== null && "id" in item;
}

export function usePagingList<T>(sourceList: Ref<T[]> | ComputedRef<T[]> | PagingQuery<T>, delayOrSyncSource?: number | Ref<T[]>) {
  const delay = typeof delayOrSyncSource === "number" ? delayOrSyncSource : 120;
  const syncSource = typeof delayOrSyncSource === "object" && delayOrSyncSource !== null && "value" in delayOrSyncSource
    ? delayOrSyncSource as Ref<T[]>
    : null;

  const pagingRef = ref<PagingRef<T> | null>(null);
  const pagingList = ref<T[]>([]);

  function getItemKey(item: T, index: number) {
    if (hasId(item)) {
      return String(item.id ?? index);
    }
    return String(index);
  }

  async function queryList(pageNo: number, pageSize: number) {
    if (isQueryMode(sourceList)) {
      const result = await sourceList(pageNo, pageSize);
      pagingRef.value?.complete(result.items);
      return;
    }

    const list = await requestMock(() => {
      const start = Math.max(pageNo - 1, 0) * pageSize;
      return sourceList.value.slice(start, start + pageSize);
    }, delay);

    pagingRef.value?.complete(list);
  }

  if (!isQueryMode(sourceList)) {
    watch(
      () => sourceList.value.map((item, index) => getItemKey(item, index)).join("|"),
      () => {
        pagingRef.value?.reload();
      }
    );
  }

  // 当有 syncSource 时，监听源数据变化，同步更新 pagingList 中对应 id 的条目
  if (syncSource) {
    watch(
      syncSource,
      (latestPosts) => {
        const currentList = pagingList.value as T[];
        if (!currentList.length) return;

        const sourceMap = new Map<string | number, T>();
        latestPosts.forEach((item) => {
          if (hasId(item)) {
            sourceMap.set(item.id, item);
          }
        });

        let changed = false;
        const nextList = currentList.map((item) => {
          if (!hasId(item)) return item;
          const latest = sourceMap.get(item.id);
          if (latest && latest !== item) {
            changed = true;
            return latest;
          }
          return item;
        });

        if (changed) {
          pagingList.value = nextList as T[];
        }
      },
      { deep: true }
    );
  }

  return {
    pagingRef,
    pagingList,
    queryList,
  };
}
