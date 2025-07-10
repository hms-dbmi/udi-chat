import { ref } from 'vue';
import { defineStore } from 'pinia';

export interface PinnedVisualization {
  index: number;
  spec: object;
}

export const useDashboardStore = defineStore('dashboardStore', () => {
  const pinnedVisualizations = ref<Map<number, PinnedVisualization>>(new Map());

  function pinVisualization(index: number, spec: object) {
    pinnedVisualizations.value.set(index, { index, spec });
  }

  function unpinVisualization(index: number) {
    pinnedVisualizations.value.delete(index);
  }

  function isPinned(index: number): boolean {
    return pinnedVisualizations.value.has(index);
  }

  return { pinnedVisualizations, pinVisualization, unpinVisualization, isPinned };
});
