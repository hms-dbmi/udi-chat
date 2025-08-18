<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useDashboardStore } from 'src/stores/dashboardStore';
const dashboardStore = useDashboardStore();
import { useDataFilterStore } from 'src/stores/dataFiltersStore';
const dataFilterStore = useDataFilterStore();
const { dataSelections } = storeToRefs(dataFilterStore);

function selectionChanged(newSelection: any) {
  // console.log('selection Changed yo');
  // console.log(newSelection);
}
</script>

<template>
  <q-scroll-area
    ref="dashboardArea"
    class="flex q-m-sm flex-grow-1"
    style="height: 100%; width: 100%"
  >
    <div class="flex row">
      <template
        v-for="(viz, index) of Array.from(dashboardStore.pinnedVisualizations.values()).reverse()"
        :key="viz.index"
      >
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
            <q-space></q-space>
            <!-- <q-btn
              icon="keyboard_return"
              @click="dashboardStore.unpinVisualization(viz.index)"
            ></q-btn> -->
          </q-toolbar>
          <template v-if="index === 0">
            <UDIVis
              :spec="viz.interactiveSpec"
              :selections="dataSelections"
              @selectionChange="selectionChanged"
            ></UDIVis>
          </template>
          <template v-else>
            <UDIVis :spec="viz.interactiveSpec"></UDIVis>
          </template>
          <!-- <pre>{{ viz.interactiveSpec }}</pre> -->
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

.hovered-viz {
  // outline: solid 1px $secondary;
}
</style>
