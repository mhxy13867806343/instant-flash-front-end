import { ref, watch, type ComputedRef, type Ref } from "vue";
import { requestMock } from "@/utils/request";

type PagingRef<T> = {
  complete: (list: T[]) => void;
  reload: () => void;
};

export function usePagingList<T>(sourceList: Ref<T[]> | ComputedRef<T[]>, delay = 120) {
  const pagingRef = ref<PagingRef<T> | null>(null);
  const pagingList = ref<T[]>([]);

  function getItemKey(item: T, index: number) {
    if (typeof item === "object" && item !== null && "id" in item) {
      return String((item as { id?: string | number }).id ?? index);
    }
    return String(index);
  }

  async function queryList(pageNo: number, pageSize: number) {
    const list = await requestMock(() => {
      const start = Math.max(pageNo - 1, 0) * pageSize;
      return sourceList.value.slice(start, start + pageSize);
    }, delay);

    pagingRef.value?.complete(list);
  }

  watch(
    () => sourceList.value.map((item, index) => getItemKey(item, index)).join("|"),
    () => {
      pagingRef.value?.reload();
    }
  );

  return {
    pagingRef,
    pagingList,
    queryList,
  };
}
