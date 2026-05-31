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

export function usePagingList<T>(sourceList: Ref<T[]> | ComputedRef<T[]> | PagingQuery<T>, delay = 120) {
  const pagingRef = ref<PagingRef<T> | null>(null);
  const pagingList = ref<T[]>([]);

  function getItemKey(item: T, index: number) {
    if (typeof item === "object" && item !== null && "id" in item) {
      return String((item as { id?: string | number }).id ?? index);
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

  return {
    pagingRef,
    pagingList,
    queryList,
  };
}
