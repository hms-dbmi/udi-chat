import { defineStore } from 'pinia';
import { ref } from 'vue';

type Row = Record<string, unknown>;

export const useDataExportStore = defineStore('dataExport', () => {
  const displayData = ref<Row[] | null>(null);
  const allData = ref<Row[] | null>(null);
  const isSubset = ref<boolean>(false);
  const sourceName = ref<string | null>(null);

  function setData(payload: {
    displayData: Row[] | null;
    allData: Row[] | null;
    isSubset: boolean;
    sourceName: string | null;
  }) {
    displayData.value = payload.displayData;
    allData.value = payload.allData;
    isSubset.value = payload.isSubset;
    sourceName.value = payload.sourceName;
  }

  function clear() {
    displayData.value = null;
    allData.value = null;
    isSubset.value = false;
    sourceName.value = null;
  }

  return {
    displayData,
    allData,
    isSubset,
    sourceName,
    setData,
    clear,
  };
});
