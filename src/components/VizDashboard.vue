<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, nextTick, ref } from 'vue';
import { compressToEncodedURIComponent } from 'lz-string';
import { useDashboardStore } from 'src/stores/dashboardStore';
import { useDataFilterStore } from 'src/stores/dataFiltersStore';
import WelcomeSplash from 'src/components/WelcomeSplash.vue';

const isProduction = import.meta.env.VITE_PRODUCTION === 'true';

const dashboardStore = useDashboardStore();
const dataFilterStore = useDataFilterStore();
const { dataSelections } = storeToRefs(dataFilterStore);

const showSpecInspector = ref(false);
const specInspectorData = ref('');
const specEditorUrl = ref('');

function openSpecInspector(spec: any) {
  specInspectorData.value = JSON.stringify(spec, null, 2);
  const compressed = compressToEncodedURIComponent(specInspectorData.value);
  specEditorUrl.value = `https://hms-dbmi.github.io/udi-grammar/#/Editor?spec=${compressed}`;
  showSpecInspector.value = true;
}

function copySpecToClipboard() {
  navigator.clipboard.writeText(specInspectorData.value);
}

const tableViewKeys = ref(new Set<string>());

function hasRepresentation(spec: any): boolean {
  return !!spec?.representation;
}

function isTableView(key: string): boolean {
  return tableViewKeys.value.has(key);
}

function toggleTableView(key: string) {
  const next = new Set(tableViewKeys.value);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }
  tableViewKeys.value = next;
}

function getDisplaySpec(spec: any, key: string): any {
  if (!tableViewKeys.value.has(key)) return spec;
  const { representation, ...rest } = spec;
  return rest;
}

function selectionChanged(newSelection: any) {
  dataFilterStore.updateInternalDataSelections(newSelection);
}

// compute once so identity is stable
const reversedPinned = computed(() =>
  Array.from(dashboardStore.pinnedVisualizations.values()).slice().reverse(),
);

const isEmpty = computed(() => dashboardStore.pinnedVisualizations.size === 0);

function vizKey(viz: { index: number; toolCallIndex: number }) {
  return dashboardStore.pinKey(viz.index, viz.toolCallIndex);
}

function toggleExpand(key: string) {
  dashboardStore.toggleExpanded(key);
  // After the DOM updates with the new container size, fire a resize event
  // so Vega-Lite's width:'container' recalculates the chart width.
  nextTick(() => {
    window.dispatchEvent(new Event('resize'));
  });
}

function getVizWidth(spec: any, key: string) {
  if (dashboardStore.isExpanded(key)) {
    return {}; // width handled by flex-basis: 100% on viz-expanded class
  }
  // todo derive value from w-500 and margin/padding
  if (!spec.representation) {
    return { width: '934px' };
  }
  const rep = Array.isArray(spec.representation) ? spec.representation : [spec.representation];
  for (const r of rep) {
    if (r.mark === 'row') {
      return { width: '934px' };
    }
  }
  return {};
}
</script>

<template>
  <q-scroll-area ref="dashboardArea" class="flexflex-grow-1" style="height: 100%; width: 100%">
    <!-- Welcome splash when no visualizations are pinned -->
    <WelcomeSplash v-if="isEmpty" />

    <!-- Visualization grid -->
    <div v-else class="flex row q-gutter-lg q-pa-md" style="flex-wrap: wrap">
      <template v-for="viz in reversedPinned" :key="viz.uuid">
        <div
          :class="`q-pa-md viz-container ${dashboardStore.isExpanded(vizKey(viz)) ? 'viz-expanded' : 'w-500'} ${dashboardStore.isHovered(vizKey(viz)) ? 'hovered-viz' : ''}`"
          :style="getVizWidth(viz.interactiveSpec, vizKey(viz))"
          @mouseover="dashboardStore.setHoveredVisualizationIndex(vizKey(viz))"
          @mouseleave="dashboardStore.setHoveredVisualizationIndex(null)"
          tabindex="0"
        >
          <!-- Close button: top-right corner, overlapping the card edge -->
          <q-btn
            class="viz-action-btn viz-close-btn"
            flat
            dense
            round
            icon="close"
            size="sm"
            @click="dashboardStore.unpinVisualization(vizKey(viz))"
          >
            <q-tooltip>Close</q-tooltip>
          </q-btn>

          <!-- Expand button: centered on the right edge -->
          <q-btn
            class="viz-action-btn viz-expand-btn"
            flat
            dense
            round
            :icon="dashboardStore.isExpanded(vizKey(viz)) ? 'unfold_less' : 'unfold_more'"
            style="transform: rotate(-90deg)"
            size="sm"
            @click="toggleExpand(vizKey(viz))"
          >
            <q-tooltip>{{
              dashboardStore.isExpanded(vizKey(viz)) ? 'Collapse' : 'Expand'
            }}</q-tooltip>
          </q-btn>

          <q-toolbar dense>
            <span class="text-caption short-text-element" :title="viz.title || viz.userPrompt">{{
              viz.title || viz.userPrompt
            }}</span>
            <q-icon
              v-if="viz.userPrompt && viz.title"
              name="chat"
              size="xs"
              class="q-ml-sm"
              color="primary"
            >
              <q-tooltip>{{ viz.userPrompt }}</q-tooltip>
            </q-icon>
            <q-space />
            <q-btn
              v-if="!isProduction && hasRepresentation(viz.interactiveSpec)"
              flat
              dense
              round
              size="sm"
              :icon="isTableView(vizKey(viz)) ? 'bar_chart' : 'table_chart'"
              @click="toggleTableView(vizKey(viz))"
            >
              <q-tooltip>{{ isTableView(vizKey(viz)) ? 'Show visualization' : 'Show table' }}</q-tooltip>
            </q-btn>
            <q-btn
              v-if="!isProduction"
              flat
              dense
              round
              size="sm"
              icon="data_object"
              @click="openSpecInspector(viz.interactiveSpec)"
            >
              <q-tooltip>Inspect spec</q-tooltip>
            </q-btn>
          </q-toolbar>
          <div class="flex-container">
            <div class="inner-container">
              <UDIVis
                :key="`${vizKey(viz)}-${isTableView(vizKey(viz))}`"
                :spec="getDisplaySpec(viz.interactiveSpec, vizKey(viz))"
                :selections="dataSelections"
                @selection-change="selectionChanged"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </q-scroll-area>

  <q-dialog v-model="showSpecInspector">
    <q-card style="min-width: 600px; max-width: 80vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Spec Inspector</div>
        <q-space />
        <q-btn
          flat
          dense
          round
          icon="open_in_new"
          tag="a"
          :href="specEditorUrl"
          target="_blank"
        >
          <q-tooltip>Open in UDI Grammar Editor</q-tooltip>
        </q-btn>
        <q-btn flat dense round icon="content_copy" @click="copySpecToClipboard">
          <q-tooltip>Copy to clipboard</q-tooltip>
        </q-btn>
        <q-btn flat dense round icon="close" v-close-popup />
      </q-card-section>
      <q-card-section class="spec-inspector-body">
        <q-markdown :src="`\`\`\`json\n${specInspectorData}\n\`\`\``" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.w-500 {
  width: 455px;
}

.viz-expanded {
  flex-basis: 100%;

  .flex-container,
  .inner-container {
    width: 100%;
  }
}

.short-text-element {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.viz-container {
  position: relative;
  border-radius: 4px;
  border: 1px solid var(--Gray-Gray04, #cad5da);
  background: var(--Generic-White, #fff);

  /* Default Shadow */
  box-shadow: 0 4px 12px 2px rgba(0, 0, 0, 0.15);
}

/* Action buttons: hidden by default, visible on hover or focus-within */
.viz-action-btn {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
  background: white;
  border: 1px solid var(--Gray-Gray04, #cad5da);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.viz-container:hover .viz-action-btn,
.viz-container:focus-within .viz-action-btn {
  opacity: 1;
  pointer-events: auto;
}

/* Also show when the button itself is focused (keyboard nav) */
.viz-action-btn:focus {
  opacity: 1;
  pointer-events: auto;
}

.viz-close-btn {
  position: absolute;
  top: -12px;
  right: -12px;
  z-index: 10;
}

.viz-expand-btn {
  position: absolute;
  top: 50%;
  right: -12px;
  transform: translateY(-50%);
  z-index: 10;
}

.hovered-viz {
  border-color: $accent;
  box-shadow: 0 4px 16px 3px #2a9d8f70;
}

.spec-inspector-body {
  overflow: auto;
  max-height: 70vh;
}
</style>
