import { defineStore } from 'pinia';
import { reactive } from 'vue';

type Row = Record<string, unknown>;
type DataPayload = {
  displayData: Row[] | null;
  allData: Row[] | null;
  isSubset: boolean;
};

export const useDataExportStore = defineStore('dataExport', () => {
  const dataBySource = reactive(new Map<string, DataPayload>());

  function setData(sourceName: string, payload: DataPayload) {
    if (!sourceName) return; // ignore bad keys
    dataBySource.set(sourceName, payload);
  }

  function getData(sourceName: string): DataPayload | undefined {
    return dataBySource.get(sourceName);
  }

  function clearSource(sourceName: string) {
    dataBySource.delete(sourceName);
  }

  function clearAll() {
    dataBySource.clear();
  }

  return {
    dataBySource,
    setData,
    getData,
    clearSource,
    clearAll,
  };
});
