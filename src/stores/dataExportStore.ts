import { defineStore } from 'pinia';
import { ref } from 'vue';

type Row = Record<string, unknown>;

export const useDataExportStore = defineStore('dataExport', () => {
  const displayData = ref<Row[] | null>(null);
  const allData = ref<Row[] | null>(null);
  const isSubset = ref<boolean>(false);

  function setData(payload: {
    displayData: Row[] | null;
    allData: Row[] | null;
    isSubset: boolean;
  }) {
    displayData.value = payload.displayData;
    allData.value = payload.allData;
    isSubset.value = payload.isSubset;
  }

  function clear() {
    displayData.value = null;
    allData.value = null;
    isSubset.value = false;
  }

  return {
    displayData,
    allData,
    isSubset,
    setData,
    clear,
  };
});
