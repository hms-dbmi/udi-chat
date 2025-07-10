import { ref } from 'vue';
import { defineStore } from 'pinia';

export interface PinnedVisualization {
  index: number;
  spec: object;
  userPrompt: string;
}

export const useDashboardStore = defineStore('dashboardStore', () => {
  const pinnedVisualizations = ref<Map<number, PinnedVisualization>>(new Map());

  const hoveredVisualizationIndex = ref<number | null>(null);
  function setHoveredVisualizationIndex(index: number | null) {
    hoveredVisualizationIndex.value = index;
  }

  function isHovered(index: number): boolean {
    return hoveredVisualizationIndex.value === index;
  }

  function pinVisualization(index: number, spec: object, userPrompt: string) {
    pinnedVisualizations.value.set(index, { index, spec, userPrompt });
  }

  function unpinVisualization(index: number) {
    pinnedVisualizations.value.delete(index);
  }

  function isPinned(index: number): boolean {
    return pinnedVisualizations.value.has(index);
  }

  return {
    pinnedVisualizations,
    pinVisualization,
    unpinVisualization,
    isPinned,
    isHovered,
    setHoveredVisualizationIndex,
  };
});
