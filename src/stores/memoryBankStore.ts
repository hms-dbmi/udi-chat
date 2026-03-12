import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { PinnedVisualization } from './dashboardStore';

export const useMemoryBankStore = defineStore('memoryBankStore', () => {
  const closedVisualizations = ref<Map<string, PinnedVisualization>>(new Map());

  function addToMemoryBank(key: string, viz: PinnedVisualization) {
    closedVisualizations.value.set(key, viz);
  }

  function removeFromMemoryBank(key: string) {
    closedVisualizations.value.delete(key);
  }

  function clearMemoryBank() {
    closedVisualizations.value.clear();
  }

  return {
    closedVisualizations,
    addToMemoryBank,
    removeFromMemoryBank,
    clearMemoryBank,
  };
});
