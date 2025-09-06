<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { watch, computed, onUpdated } from 'vue';
import { useDashboardStore } from 'src/stores/dashboardStore';
const dashboardStore = useDashboardStore();
import { useDataFilterStore } from 'src/stores/dataFiltersStore';
const dataFilterStore = useDataFilterStore();
const { validDataSelections, dataSelections } = storeToRefs(dataFilterStore);

function selectionChanged(newSelection: any) {
  dataFilterStore.updateInternalDataSelections(newSelection);
}

// compute once so identity is stable
const reversedPinned = computed(() =>
  Array.from(dashboardStore.pinnedVisualizations.values()).slice().reverse(),
);
</script>

<template>
  <q-scroll-area ref="dashboardArea" class="flexflex-grow-1" style="height: 100%; width: 100%">
    <div class="flex row q-gutter-lg q-pa-md" style="flex-wrap: wrap">
      <template v-for="(viz, index) in reversedPinned" :key="viz.id ?? viz.index">
        <div
          :class="`w-500 q-pa-md viz-container ${dashboardStore.isHovered(viz.index) ? 'hovered-viz' : ''}`"
          @mouseover="dashboardStore.setHoveredVisualizationIndex(viz.index)"
          @mouseleave="dashboardStore.setHoveredVisualizationIndex(null)"
        >
          <q-toolbar dense>
            <span class="text-caption text-weight-light">Prompt: </span>
            <span class="text-caption short-text-element q-ml-xs" :title="viz.userPrompt">{{
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
              <UDIVis v-else :selections="dataSelections" :spec="viz.interactiveSpec" />
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
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.viz-container {
  border-radius: 4px;
  border: 1px solid var(--Gray-Gray04, #cad5da);
  background: var(--Generic-White, #fff);

  /* Default Shadow */
  box-shadow: 0 4px 12px 2px rgba(0, 0, 0, 0.15);
}

.hovered-viz {
  // outline: solid 4px $accent;
  border-color: $accent;
  // box-shadow: 0 4px 12px 2px #2a9d8f70;
  box-shadow: 0 4px 16px 3px #2a9d8f70;
}
</style>
