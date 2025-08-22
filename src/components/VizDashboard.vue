<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { watch, computed } from 'vue';
import { useDashboardStore } from 'src/stores/dashboardStore';
const dashboardStore = useDashboardStore();
import { useDataFilterStore } from 'src/stores/dataFiltersStore';
const dataFilterStore = useDataFilterStore();
const { dataSelections } = storeToRefs(dataFilterStore);
import { useDataExportStore } from 'src/stores/dataExportStore';
const dataExportStore = useDataExportStore();

function selectionChanged(newSelection: any) {}

watch(
  () => Array.from(dashboardStore.pinnedVisualizations.values()).at(-1)?.interactiveSpec,
  (newSpec) => {
    if (newSpec) console.log('Latest viz spec:', newSpec);
    console.log('pinnedVisualizations', dashboardStore.pinnedVisualizations);
    console.log('Data selections:', dataSelections.value);
  },
  { immediate: true }
);

function onDataUpdate(
  payload: {
    displayData: object[] | null;
    allData: object[] | null;
    isSubset: boolean;
  },
  sourceName: string
) {
  console.log('UDIVis displayData:', payload.displayData);
  console.log('UDIVis allData:', payload.allData);
  console.log('UDIVis isSubset:', payload.isSubset);
  console.log('UDIVis sourceName:', sourceName);

  if (!sourceName) return;

  dataExportStore.setData(sourceName, {
    displayData: payload.displayData as Record<string, unknown>[] | null,
    allData: payload.allData as Record<string, unknown>[] | null,
    isSubset: payload.isSubset,
  });
}

function onChildDataUpdate(
  vizId: string,
  payload: { displayData: object[] | null; allData: object[] | null; isSubset: boolean; },
  spec: any
) {
  console.log('Data update payload from', vizId, payload);

  const srcs = Array.isArray(spec.source) ? spec.source : [spec.source];
  srcs.forEach((s: any) => {
    if (s?.name) onDataUpdate(payload, s.name);
  });
}

// compute once so identity is stable
const reversedPinned = computed(() =>
  Array.from(dashboardStore.pinnedVisualizations.values()).slice().reverse()
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
            <span class="text-caption short-text-element" :title="viz.userPrompt">{{ viz.userPrompt }}</span>
            <q-space />
          </q-toolbar>
          <UDIVis
            :spec="viz.interactiveSpec"
            :selections="dataSelections"
            @selection-change="selectionChanged"
            @data-update="onChildDataUpdate(viz.id ?? String(viz.index), $event, viz.interactiveSpec)"
          />
        </div>
      </template>
    </div>
  </q-scroll-area>
</template>
