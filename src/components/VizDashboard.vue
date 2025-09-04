<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { watch, computed } from 'vue';
import { useDashboardStore } from 'src/stores/dashboardStore';
const dashboardStore = useDashboardStore();
import { useDataFilterStore } from 'src/stores/dataFiltersStore';
const dataFilterStore = useDataFilterStore();
const { dataSelections } = storeToRefs(dataFilterStore);

function selectionChanged(newSelection: any) {
  console.log('chagning selection');
}

watch(
  () => Array.from(dashboardStore.pinnedVisualizations.values()).at(-1)?.interactiveSpec,
  (newSpec) => {
    if (newSpec) console.log('Latest viz spec:', newSpec);
    console.log('pinnedVisualizations', dashboardStore.pinnedVisualizations);
    console.log('Data selections:', dataSelections.value);
  },
  { immediate: true },
);

// compute once so identity is stable
const reversedPinned = computed(() =>
  Array.from(dashboardStore.pinnedVisualizations.values()).slice().reverse(),
);
</script>

<template>
  <q-scroll-area
    ref="dashboardArea"
    class="flex q-m-sm flex-grow-1"
    style="height: 100%; width: 100%"
  >
    <div class="flex row">
      <template v-for="(viz, index) in reversedPinned" :key="viz.id ?? viz.index">
        <div
          :class="`w-500 q-pa-md ${dashboardStore.isHovered(viz.index) ? 'hovered-viz' : ''}`"
          @mouseover="dashboardStore.setHoveredVisualizationIndex(viz.index)"
          @mouseleave="dashboardStore.setHoveredVisualizationIndex(null)"
        >
          <q-toolbar dense>
            <span class="text-caption text-weight-light">Prompt: </span>
            <span class="text-caption short-text-element" :title="viz.userPrompt">{{
              viz.userPrompt
            }}</span>
            <q-space />
          </q-toolbar>
          <div class="flex-container">
            <div class="inner-container">
              <UDIVis
                v-if="index === 0"
                :spec="viz.interactiveSpec"
                :selections="dataSelections"
                @selection-change="selectionChanged"
              />
              <UDIVis v-else :spec="viz.interactiveSpec" />
            </div>
          </div>
        </div>
      </template>
    </div>
  </q-scroll-area>
</template>

<style scoped lang="scss">
.w-500 {
  width: 500px;
}

.short-text-element {
  max-width: 260px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
</style>
