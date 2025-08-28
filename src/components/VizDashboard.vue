<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { watch, computed } from 'vue';
import { useDashboardStore } from 'src/stores/dashboardStore';
import CountsBridge from 'components/CountsBridge.vue';
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
  { immediate: true }
);

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

function classify(name?: string): { id: string; typeLabel: string; icon: string } {
  const s = (name ?? '').toLowerCase();
  if (/(^|[^a-z])donors?($|[^a-z])/.test(s)) return { id: 'donors', typeLabel: 'donors', icon: 'person' };
  if (/(^|[^a-z])samples?($|[^a-z])/.test(s) || s.includes('biological sample'))
    return { id: 'samples', typeLabel: 'samples', icon: 'bubble_chart' };
  if (/(^|[^a-z])datasets?($|[^a-z])/.test(s) || s === 'data')
    return { id: 'datasets', typeLabel: 'datasets', icon: 'table_chart' };
  return { id: s || 'entities', typeLabel: s || 'entities', icon: 'dataset' };
}
function getEntityFromSpec(spec: any) {
  const srcs = Array.isArray(spec?.source) ? spec.source : [spec?.source].filter(Boolean);
  for (const s of srcs) {
    const c = classify(s?.name);
    if (['donors', 'samples', 'datasets'].includes(c.id)) return c;
  }
  const first = srcs[0]?.name as string | undefined;
  return classify(first);
}
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
          <div class="flex-container">
            <div class="inner-container">
              <UDIVis
                :spec="viz.interactiveSpec"
                :selections="dataSelections"
                @selection-change="selectionChanged"
              />
            </div>
            <div class="inner-container">
              <UDIVis :spec="viz.countsSpec" :selections="dataSelections" @selection-change="selectionChanged">
                <template #default="{ data, allData, isSubset }">
                  <CountsBridge
                    v-bind="getEntityFromSpec(viz.countsSpec)"
                    :count="Array.isArray(data) ? data.length : 0"
                    :total="Array.isArray(allData) ? allData.length : 0"
                  />
                </template>
              </UDIVis>
          </div>
        </div>
        </div>
      </template>
    </div>
  </q-scroll-area>
</template>
